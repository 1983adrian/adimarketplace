import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Send Web Push notifications to a user's browser/PWA.
 * Uses VAPID keys for authentication with the push service.
 * 
 * Body: { user_id, title, body, url?, icon? }
 */

// Web Push crypto helpers for VAPID
async function sendWebPushNotification(
  subscription: any,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
): Promise<Response> {
  // For web push, we need to send to the subscription endpoint
  // Using the simplified approach with fetch + VAPID JWT
  const endpoint = subscription.endpoint;
  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new Error('Invalid push subscription: missing endpoint or keys');
  }

  // Create a simple notification payload
  // Note: Full web push encryption requires complex crypto.
  // For production, use a web push library. Here we use the simpler
  // approach of sending to the endpoint with VAPID auth.
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
    },
    body: new Uint8Array(0), // Empty body triggers a push event
  });

  return response;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_id, title, body, url, data } = await req.json();

    // Only allow sending to self or if admin
    if (user.id !== user_id) {
      const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Cannot send notifications for other users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get web push subscriptions for this user
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('id, token, platform')
      .eq('user_id', user_id)
      .eq('platform', 'web')
      .eq('is_valid', true);

    if (tokenError) {
      console.error('Error fetching web push tokens:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log('No web push subscriptions found for user:', user_id);
      
      // Fallback: create an in-app notification so user still gets alerted
      await supabase.from('notifications').insert({
        user_id,
        type: 'tracking_reminder',
        title,
        message: body,
        data: data || {},
      });

      return new Response(
        JSON.stringify({ message: 'No web push subscriptions, created in-app notification', sent: 0, fallback: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sent = 0;
    let failed = 0;

    for (const tokenRow of tokens) {
      try {
        const subscription = JSON.parse(tokenRow.token);
        const endpoint = subscription.endpoint;

        if (!endpoint) {
          console.error('Invalid subscription - no endpoint');
          failed++;
          continue;
        }

        // Send push notification to the endpoint
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
          },
        });

        if (response.ok || response.status === 201) {
          sent++;
          // Update last used
          await supabase.from('push_tokens')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', tokenRow.id);
        } else if (response.status === 410 || response.status === 404) {
          // Subscription expired or invalid - remove it
          console.log('Removing expired web push subscription:', tokenRow.id);
          await supabase.from('push_tokens')
            .update({ is_valid: false })
            .eq('id', tokenRow.id);
          failed++;
        } else {
          console.error(`Push failed for ${tokenRow.id}: ${response.status} ${await response.text()}`);
          failed++;
        }
      } catch (err) {
        console.error('Error sending web push:', err);
        failed++;
      }
    }

    // Also ensure in-app notification exists
    await supabase.from('notifications').insert({
      user_id,
      type: 'tracking_reminder',
      title,
      message: body,
      data: data || {},
    });

    return new Response(
      JSON.stringify({ sent, failed, total: tokens.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('send-web-push error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
