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

    const { listingId } = await req.json();

    if (!listingId) {
      return new Response(
        JSON.stringify({ error: 'Missing listingId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the listing belongs to the user
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select('id, seller_id, title, is_active')
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

    if (!listing.is_active) {
      return new Response(
        JSON.stringify({ error: 'Cannot promote inactive listing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if listing already has an active paid promotion
    const { data: existingPromo } = await supabaseAdmin
      .from('listing_promotions')
      .select('id, ends_at')
      .eq('listing_id', listingId)
      .eq('promotion_type', 'paid')
      .eq('is_active', true)
      .gt('ends_at', new Date().toISOString())
      .maybeSingle();

    if (existingPromo) {
      return new Response(
        JSON.stringify({ 
          error: `This listing already has an active promotion until ${new Date(existingPromo.ends_at).toLocaleDateString('ro-RO')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get promotion fee from platform_fees
    const { data: promotionFee, error: feeError } = await supabaseAdmin
      .from('platform_fees')
      .select('*')
      .eq('fee_type', 'weekly_promotion')
      .eq('is_active', true)
      .single();

    if (feeError || !promotionFee) {
      return new Response(
        JSON.stringify({ error: 'Promotion fee not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const promotionAmount = promotionFee.amount;
    const promotionDuration = 7; // days

    // Calculate 7 days from now
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + promotionDuration * 24 * 60 * 60 * 1000);

    // NOTE: Promoția este creată ca INACTIVĂ până când adminul confirmă plata.
    // Nu există un procesor de plăți automat — plata se face prin Revolut, 
    // iar adminul activează manual promoția din panoul de administrare.
    const { data: promotion, error: promoError } = await supabaseAdmin
      .from('listing_promotions')
      .insert({
        listing_id: listingId,
        seller_id: user.id,
        promotion_type: 'paid',
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        is_active: false, // Activată de admin după confirmarea plății
        amount_paid: promotionAmount
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

    // Log the platform activity
    await supabaseAdmin
      .from('platform_activity')
      .insert({
        activity_type: 'promotion_purchased',
        entity_type: 'listing',
        entity_id: listingId,
        user_id: user.id,
        is_public: false,
        metadata: {
          promotion_id: promotion.id,
          amount_paid: promotionAmount,
          duration_days: promotionDuration
        }
      });

    // Send notification to seller - cerere în așteptare
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'promotion',
        title: '⏳ Cerere promovare trimisă',
        message: `Cererea de promovare pentru "${listing.title}" (${promotionAmount} LEI) așteaptă confirmarea plății de către admin.`,
        data: { 
          listing_id: listingId,
          promotion_id: promotion.id,
          status: 'pending_payment',
          ends_at: endsAt.toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        promotion,
        message: `Cererea de promovare a fost trimisă. Plătește ${promotionAmount} LEI prin Revolut, iar adminul va activa promoția.`,
        amountPaid: promotionAmount,
        status: 'pending_payment',
        endsAt: endsAt.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in create-paid-promotion:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
