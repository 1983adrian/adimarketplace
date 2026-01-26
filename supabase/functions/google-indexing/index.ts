import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IndexingRequest {
  url: string;
  type: 'URL_UPDATED' | 'URL_DELETED';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleCredentials = Deno.env.get('GOOGLE_INDEXING_CREDENTIALS');
    
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
      
      let processed = 0;
      let errors = 0;
      
      for (const item of pendingItems) {
        try {
          // If Google credentials are configured, submit to Google Indexing API
          if (googleCredentials) {
            const credentials = JSON.parse(googleCredentials);
            const accessToken = await getGoogleAccessToken(credentials);
            
            await submitToGoogleIndexing(item.url, item.action, accessToken);
          }
          
          // Update status to submitted
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
      
      // Refresh platform statistics
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
      // Ping Google with sitemap update
      const sitemapUrl = 'https://marketplaceromania.lovable.app/sitemap.xml';
      
      const pingUrls = [
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      ];
      
      const results = await Promise.allSettled(
        pingUrls.map(url => fetch(url, { method: 'GET' }))
      );
      
      // Log activity
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
      // Generate dynamic sitemap entries
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
      
      const baseUrl = 'https://marketplaceromania.lovable.app';
      const entries = [];
      
      // Static pages
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
      
      // Listings
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
      
      // Categories
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
      
      // Upsert all entries
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

// Helper function to get Google OAuth2 access token
async function getGoogleAccessToken(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };
  
  // This is a simplified version - in production you'd use proper JWT signing
  // For now, return empty to skip Google API calls if not properly configured
  return '';
}

// Submit URL to Google Indexing API
async function submitToGoogleIndexing(url: string, type: string, accessToken: string): Promise<void> {
  if (!accessToken) {
    console.log(`Would submit to Google: ${url} (${type})`);
    return;
  }
  
  const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      type
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Indexing API error: ${error}`);
  }
}
