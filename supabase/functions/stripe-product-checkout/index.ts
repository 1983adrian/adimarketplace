import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-PRODUCT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid authentication");
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { listingId, shippingAddress, shippingMethod } = await req.json();
    if (!listingId) throw new Error("Listing ID is required");

    // Get listing details
    const { data: listing, error: listingError } = await supabaseClient
      .from("listings")
      .select("*, listing_images(*)")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      throw new Error("Listing not found");
    }

    if (listing.is_sold) {
      throw new Error("This item has already been sold");
    }

    logStep("Listing found", { title: listing.title, price: listing.price });

    // Get platform fees
    const { data: fees } = await supabaseClient
      .from("platform_fees")
      .select("*")
      .eq("is_active", true);

    const buyerFeeConfig = fees?.find(f => f.fee_type === "buyer_fee");
    const sellerCommissionConfig = fees?.find(f => f.fee_type === "seller_commission");

    const buyerFee = buyerFeeConfig?.amount ?? 2; // £2 buyer fee
    // Check if commission is percentage or fixed amount
    const isPercentageCommission = sellerCommissionConfig?.is_percentage ?? false;
    const commissionValue = sellerCommissionConfig?.amount ?? 1; // Default £1 fixed commission

    // Calculate shipping cost
    const shippingCost = shippingMethod === 'express' ? 14.99 : 
                         shippingMethod === 'overnight' ? 29.99 : 5.99;

    const itemPrice = listing.price;
    // Calculate seller commission based on whether it's percentage or fixed
    const sellerCommission = isPercentageCommission 
      ? itemPrice * (commissionValue / 100) 
      : commissionValue; // Fixed £1 per sale
    const payoutAmount = itemPrice - sellerCommission;
    const totalAmount = itemPrice + shippingCost + buyerFee;

    logStep("Fees calculated", { 
      itemPrice, 
      buyerFee, 
      shippingCost,
      sellerCommission,
      isPercentageCommission,
      payoutAmount,
      totalAmount 
    });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Get the listing image for Stripe
    const listingImage = listing.listing_images?.[0]?.image_url || null;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: listing.title,
              description: `Condiție: ${listing.condition}`,
              images: listingImage ? [listingImage] : [],
            },
            unit_amount: Math.round(itemPrice * 100), // Convert to pence
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Taxă platformă",
              description: "Taxă de procesare pentru cumpărător",
            },
            unit_amount: Math.round(buyerFee * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Livrare ${shippingMethod === 'express' ? 'Express' : shippingMethod === 'overnight' ? 'Overnight' : 'Standard'}`,
            },
            unit_amount: Math.round(shippingCost * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}&listing=${listingId}`,
      cancel_url: `${req.headers.get("origin")}/listing/${listingId}?cancelled=true`,
      metadata: {
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        item_price: itemPrice.toString(),
        buyer_fee: buyerFee.toString(),
        shipping_cost: shippingCost.toString(),
        seller_commission: sellerCommission.toString(),
        payout_amount: payoutAmount.toString(),
        total_amount: totalAmount.toString(),
        shipping_address: shippingAddress || "",
        shipping_method: shippingMethod || "standard",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
