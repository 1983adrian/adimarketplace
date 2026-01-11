import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ORDER-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { listingId, shippingAddress, shippingMethod } = await req.json();
    
    if (!listingId) {
      throw new Error("Listing ID is required");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Fetch the listing
    const { data: listing, error: listingError } = await supabaseClient
      .from("listings")
      .select("*, profiles(*)")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      throw new Error("Listing not found");
    }

    if (listing.is_sold) {
      throw new Error("This item has already been sold");
    }

    logStep("Listing fetched", { listingId, price: listing.price, sellerId: listing.seller_id });

    // Fetch platform fees
    const { data: fees, error: feesError } = await supabaseClient
      .from("platform_fees")
      .select("*")
      .eq("is_active", true);

    if (feesError) {
      throw new Error("Failed to fetch platform fees");
    }

    const buyerFee = fees?.find(f => f.fee_type === "buyer_fee")?.amount || 2.00;
    const sellerCommissionRate = fees?.find(f => f.fee_type === "seller_commission")?.amount || 20.00;

    // Calculate amounts (all in pence)
    const itemPricePence = Math.round(listing.price * 100);
    const buyerFeePence = Math.round(buyerFee * 100);
    const shippingPence = shippingMethod === "express" ? 599 : shippingMethod === "overnight" ? 999 : 0;
    const totalPence = itemPricePence + buyerFeePence + shippingPence;
    
    // Calculate seller commission (what platform keeps from item price)
    const commissionPence = Math.round(itemPricePence * (sellerCommissionRate / 100));
    const sellerPayoutPence = itemPricePence - commissionPence;

    logStep("Calculated fees", { 
      itemPrice: itemPricePence, 
      buyerFee: buyerFeePence, 
      shipping: shippingPence,
      total: totalPence,
      commission: commissionPence,
      sellerPayout: sellerPayoutPence 
    });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if buyer has a Stripe customer record
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: listing.title,
              description: `Item from marketplace`,
            },
            unit_amount: itemPricePence,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Platform Fee",
              description: "Buyer service fee",
            },
            unit_amount: buyerFeePence,
          },
          quantity: 1,
        },
        ...(shippingPence > 0 ? [{
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Shipping (${shippingMethod})`,
            },
            unit_amount: shippingPence,
          },
          quantity: 1,
        }] : []),
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/listing/${listingId}`,
      metadata: {
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        item_price_pence: itemPricePence.toString(),
        buyer_fee_pence: buyerFeePence.toString(),
        shipping_pence: shippingPence.toString(),
        commission_pence: commissionPence.toString(),
        seller_payout_pence: sellerPayoutPence.toString(),
        shipping_address: JSON.stringify(shippingAddress),
        shipping_method: shippingMethod || "standard",
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

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
