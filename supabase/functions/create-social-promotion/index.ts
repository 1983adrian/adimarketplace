import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { listingId, platform } = await req.json();

    if (!listingId || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing listingId or platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the listing belongs to the user
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select('id, seller_id, title')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (listing.seller_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to promote this listing' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if listing already has an active social promotion from this platform in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: existingPromo } = await supabaseAdmin
      .from('listing_promotions')
      .select('id')
      .eq('listing_id', listingId)
      .eq('promotion_type', 'social_share')
      .eq('platform', platform)
      .gte('created_at', twentyFourHoursAgo)
      .maybeSingle();

    if (existingPromo) {
      return new Response(
        JSON.stringify({ error: `You already shared on ${platform} in the last 24 hours` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate 12 hours from now
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + 12 * 60 * 60 * 1000);

    // Create the promotion
    const { data: promotion, error: promoError } = await supabaseAdmin
      .from('listing_promotions')
      .insert({
        listing_id: listingId,
        seller_id: user.id,
        promotion_type: 'social_share',
        platform: platform,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        is_active: true,
        amount_paid: 0
      })
      .select()
      .single();

    if (promoError) {
      console.error('Error creating promotion:', promoError);
      return new Response(
        JSON.stringify({ error: 'Failed to create promotion' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        promotion,
        message: `Your listing will be featured for 12 hours! Share it on ${platform} now.`,
        endsAt: endsAt.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in create-social-promotion:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
