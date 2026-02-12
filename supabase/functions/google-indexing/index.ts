import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action } = await req.json();
    
    if (action === 'process_queue') {
      // Process pending items from the indexing queue
      const { data: pendingItems, error: fetchError } = await supabase
        .from('seo_indexing_queue')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .limit(100);
      
      if (fetchError) throw fetchError;
      
      if (!pendingItems || pendingItems.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: 'No pending items', processed: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // NOTE: Google Indexing API requires a Google Service Account with proper credentials.
      // The GOOGLE_INDEXING_CREDENTIALS secret must contain a valid service account JSON key.
      // Without it, URLs are queued but NOT submitted to Google.
      const googleCredentials = Deno.env.get('GOOGLE_INDEXING_CREDENTIALS');
      
      if (!googleCredentials) {
        // Mark items as queued but log that no credentials are configured
        console.warn('GOOGLE_INDEXING_CREDENTIALS not configured - URLs queued but not submitted to Google');
        
        for (const item of pendingItems) {
          await supabase
            .from('seo_indexing_queue')
            .update({ 
              status: 'queued_no_credentials', 
              error_message: 'Google Indexing API credentials not configured',
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);
        }

        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `${pendingItems.length} URLs queued but Google credentials not configured`,
            processed: 0,
            queued: pendingItems.length,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let processed = 0;
      let errors = 0;
      
      for (const item of pendingItems) {
        try {
          const credentials = JSON.parse(googleCredentials);
          const accessToken = await getGoogleAccessToken(credentials);
          
          if (!accessToken) {
            throw new Error('Failed to obtain Google access token - check service account credentials');
          }
          
          await submitToGoogleIndexing(item.url, item.action, accessToken);
          
          await supabase
            .from('seo_indexing_queue')
            .update({ 
              status: 'submitted', 
              submitted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);
          
          processed++;
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Error processing ${item.url}:`, errorMessage);
          
          await supabase
            .from('seo_indexing_queue')
            .update({ 
              status: 'failed', 
              error_message: errorMessage,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);
          
          errors++;
        }
      }
      
      // Update content freshness signal
      await supabase
        .from('content_freshness')
        .update({ last_updated_at: new Date().toISOString() })
        .eq('content_type', 'browse');
      
      await supabase.rpc('refresh_platform_statistics');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed, 
          errors,
          message: `Processed ${processed} URLs, ${errors} errors`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'ping_google') {
      const sitemapUrl = 'https://www.marketplaceromania.com/sitemap.xml';
      
      const pingUrls = [
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      ];
      
      const results = await Promise.allSettled(
        pingUrls.map(url => fetch(url, { method: 'GET' }))
      );
      
      await supabase
        .from('platform_activity')
        .insert({
          activity_type: 'sitemap_ping',
          entity_type: 'seo',
          is_public: false,
          metadata: { 
            pinged_at: new Date().toISOString(),
            results: results.map((r, i) => ({
              url: pingUrls[i],
              success: r.status === 'fulfilled'
            }))
          }
        });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Sitemap ping sent to Google and Bing'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'generate_sitemap') {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, updated_at')
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('updated_at', { ascending: false })
        .limit(1000);
      
      const { data: categories } = await supabase
        .from('categories')
        .select('slug, created_at');
      
      const baseUrl = 'https://www.marketplaceromania.com';
      const entries = [];
      
      const staticPages = [
        { url: '/', priority: 1.0, changefreq: 'hourly' },
        { url: '/browse', priority: 0.9, changefreq: 'hourly' },
        { url: '/login', priority: 0.7, changefreq: 'monthly' },
        { url: '/signup', priority: 0.7, changefreq: 'monthly' },
        { url: '/seller-tutorial', priority: 0.8, changefreq: 'weekly' },
        { url: '/about-us', priority: 0.6, changefreq: 'monthly' },
        { url: '/help', priority: 0.6, changefreq: 'monthly' },
        { url: '/faq', priority: 0.6, changefreq: 'monthly' },
        { url: '/contact', priority: 0.5, changefreq: 'monthly' },
        { url: '/safety-tips', priority: 0.5, changefreq: 'monthly' },
        { url: '/install-app', priority: 0.5, changefreq: 'monthly' },
      ];
      
      for (const page of staticPages) {
        entries.push({
          url: `${baseUrl}${page.url}`,
          changefreq: page.changefreq,
          priority: page.priority,
          entry_type: 'static',
          lastmod: new Date().toISOString()
        });
      }
      
      if (listings) {
        for (const listing of listings) {
          entries.push({
            url: `${baseUrl}/listing/${listing.id}`,
            changefreq: 'daily',
            priority: 0.8,
            entry_type: 'listing',
            entity_id: listing.id,
            lastmod: listing.updated_at
          });
        }
      }
      
      if (categories) {
        for (const cat of categories) {
          entries.push({
            url: `${baseUrl}/browse?category=${cat.slug}`,
            changefreq: 'daily',
            priority: 0.7,
            entry_type: 'category',
            lastmod: new Date().toISOString()
          });
        }
      }
      
      for (const entry of entries) {
        await supabase
          .from('sitemap_entries')
          .upsert(entry, { onConflict: 'url' });
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          entries_count: entries.length,
          message: `Generated ${entries.length} sitemap entries`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper: Get Google OAuth2 access token using service account
async function getGoogleAccessToken(credentials: { client_email: string; private_key: string }): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // Create JWT header and payload
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }));

    // Sign JWT with private key using Web Crypto API
    const pemKey = credentials.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\n/g, '');
    
    const binaryKey = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureInput = new TextEncoder().encode(`${header}.${payload}`);
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, signatureInput);
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const jwt = `${header}.${payload}.${signatureB64}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token || '';
  } catch (err) {
    console.error('Google auth error:', err);
    return '';
  }
}

// Submit URL to Google Indexing API
async function submitToGoogleIndexing(url: string, type: string, accessToken: string): Promise<void> {
  if (!accessToken) {
    throw new Error('No access token available for Google Indexing API');
  }
  
  const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Indexing API error: ${error}`);
  }
}
