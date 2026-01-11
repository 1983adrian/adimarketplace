import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, listingId, orderId } = await req.json();
    logStep("Request received", { action, listingId, orderId });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header (optional for getting client ID)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    // Action: get-client-id - returns the PayPal client ID for frontend SDK
    if (action === "get-client-id") {
      const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
      if (!clientId) {
        throw new Error("PayPal client ID not configured");
      }
      logStep("Returning client ID");
      return new Response(JSON.stringify({ clientId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Action: create-order - creates an order record and returns order details
    if (action === "create-order") {
      if (!listingId) {
        throw new Error("Listing ID is required");
      }

      // Get listing details
      const { data: listing, error: listingError } = await supabaseClient
        .from("listings")
        .select("*, listing_images(*)")
        .eq("id", listingId)
        .single();

      if (listingError || !listing) {
        throw new Error("Listing not found");
      }

      // Get platform fees for buyer fee calculation
      const { data: buyerFeeConfig } = await supabaseClient
        .from("platform_fees")
        .select("amount")
        .eq("fee_type", "buyer_fee")
        .eq("is_active", true)
        .single();

      const buyerFee = buyerFeeConfig?.amount ?? 2; // Default £2 buyer fee
      const totalAmount = listing.price + buyerFee;

      logStep("Order details calculated", { 
        listingPrice: listing.price, 
        buyerFee, 
        totalAmount,
        listingTitle: listing.title
      });

      return new Response(JSON.stringify({
        listingId: listing.id,
        title: listing.title,
        price: listing.price,
        buyerFee,
        totalAmount,
        sellerId: listing.seller_id,
        currency: "GBP",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Action: capture-order - records the completed payment
    if (action === "capture-order") {
      if (!user) {
        throw new Error("Authentication required to complete purchase");
      }

      if (!orderId || !listingId) {
        throw new Error("Order ID and Listing ID are required");
      }

      // Get listing details
      const { data: listing, error: listingError } = await supabaseClient
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (listingError || !listing) {
        throw new Error("Listing not found");
      }

      // Get platform fees
      const { data: fees } = await supabaseClient
        .from("platform_fees")
        .select("*")
        .eq("is_active", true);

      const buyerFee = fees?.find(f => f.fee_type === "buyer_fee")?.amount ?? 2;
      const totalAmount = listing.price + buyerFee;

      // Create order record
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          amount: totalAmount,
          status: "paid",
          stripe_payment_intent_id: `paypal_${orderId}`, // Store PayPal order ID
        })
        .select()
        .single();

      if (orderError) {
        logStep("Error creating order", orderError);
        throw new Error("Failed to create order");
      }

      // Mark listing as sold
      await supabaseClient
        .from("listings")
        .update({ is_sold: true, is_active: false })
        .eq("id", listingId);

      logStep("Order captured successfully", { orderId: order.id });

      return new Response(JSON.stringify({
        success: true,
        orderId: order.id,
        message: "Payment completed successfully",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
