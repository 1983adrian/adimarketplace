import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMOTION_PRICE = 300; // £3.00 in pence

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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

    // Get promotion fee from database
    const { data: feeData } = await supabaseClient
      .from('platform_fees')
      .select('amount')
      .eq('fee_type', 'weekly_promotion')
      .eq('is_active', true)
      .single();

    const promotionPrice = feeData ? Math.round(feeData.amount * 100) : PROMOTION_PRICE;

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session for one-time payment
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Weekly Listing Promotion',
              description: `Promote "${listing.title}" for 7 days on the homepage`,
            },
            unit_amount: promotionPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?promotion=success&listing=${listingId}`,
      cancel_url: `${origin}/dashboard?promotion=cancelled`,
      metadata: {
        listing_id: listingId,
        user_id: user.id,
        promotion_type: 'paid',
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
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
