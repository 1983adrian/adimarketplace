import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PAYOUT] ${step}${detailsStr}`);
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { order_id, auto_payout = false } = await req.json();
    if (!order_id) throw new Error("Order ID is required");
    logStep("Processing order", { orderId: order_id, autoPayout: auto_payout });

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*, listings(title, price)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }
    logStep("Order fetched", { order });

    // Verify user is the buyer confirming delivery
    if (order.buyer_id !== user.id) {
      throw new Error("Only the buyer can confirm delivery");
    }

    // Verify order status
    if (order.status !== "shipped") {
      throw new Error("Order must be shipped before confirming delivery");
    }

    // Fetch platform fees
    const { data: fees, error: feesError } = await supabaseClient
      .from("platform_fees")
      .select("*")
      .eq("is_active", true);

    if (feesError) {
      throw new Error("Error fetching platform fees");
    }
    logStep("Fees fetched", { fees });

    // Calculate fees
    const grossAmount = Number(order.amount);
    let buyerFee = 0;
    let sellerCommission = 0;

    for (const fee of fees || []) {
      if (fee.fee_type === "buyer_fee" || fee.fee_type === "buyer_service_fee") {
        buyerFee = fee.is_percentage ? (grossAmount * Number(fee.amount) / 100) : Number(fee.amount);
      } else if (fee.fee_type === "seller_commission") {
        sellerCommission = fee.is_percentage ? (grossAmount * Number(fee.amount) / 100) : Number(fee.amount);
      }
    }

    // Net amount to seller = gross - seller commission
    const netAmount = grossAmount - sellerCommission;
    logStep("Fees calculated", { grossAmount, buyerFee, sellerCommission, netAmount });

    // Update order status to delivered
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update({
        status: "delivered",
        delivery_confirmed_at: new Date().toISOString(),
        payout_amount: netAmount,
        payout_status: "pending",
        buyer_fee: buyerFee,
        seller_commission: sellerCommission,
      })
      .eq("id", order_id);

    if (updateError) {
      throw new Error(`Error updating order: ${updateError.message}`);
    }
    logStep("Order updated to delivered");

    // Get seller's Stripe account ID from profile
    const { data: sellerProfile } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id')
      .eq('user_id', order.seller_id)
      .single();
    
    const { data: sellerAuth } = await supabaseClient.auth.admin.getUserById(order.seller_id);
    logStep("Seller info", { 
      stripeAccountId: sellerProfile?.stripe_account_id, 
      email: sellerAuth?.user?.email 
    });

    // Create payout record
    const { data: payout, error: payoutError } = await supabaseClient
      .from("payouts")
      .insert({
        order_id: order_id,
        seller_id: order.seller_id,
        gross_amount: grossAmount,
        buyer_fee: buyerFee,
        seller_commission: sellerCommission,
        net_amount: netAmount,
        status: "pending",
      })
      .select()
      .single();

    if (payoutError) {
      throw new Error(`Error creating payout: ${payoutError.message}`);
    }
    logStep("Payout record created", { payoutId: payout.id });

    // Attempt automatic Stripe Transfer if seller has Stripe account
    let stripeTransferId: string | null = null;
    let payoutStatus = "pending";

    if (sellerProfile?.stripe_account_id) {
      try {
        logStep("Attempting Stripe Transfer", { 
          stripeAccountId: sellerProfile.stripe_account_id, 
          amount: Math.round(netAmount * 100) // Convert to pence
        });
        
        // Create a transfer to the connected account
        const transfer = await stripe.transfers.create({
          amount: Math.round(netAmount * 100), // Amount in pence
          currency: "gbp",
          destination: sellerProfile.stripe_account_id,
          transfer_group: `ORDER_${order_id}`,
          metadata: {
            order_id: order_id,
            payout_id: payout.id,
            listing_title: order.listings?.title || 'Item',
          },
        });

        stripeTransferId = transfer.id;
        payoutStatus = "completed";
        logStep("Stripe transfer completed", { transferId: transfer.id });

        // Update payout record with Stripe transfer ID
        await supabaseClient
          .from("payouts")
          .update({
            stripe_transfer_id: stripeTransferId,
            status: "completed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", payout.id);

        // Update order payout status
        await supabaseClient
          .from("orders")
          .update({
            payout_status: "completed",
            payout_at: new Date().toISOString(),
          })
          .eq("id", order_id);

      } catch (stripeError) {
        logStep("Stripe transfer failed", { 
          error: stripeError instanceof Error ? stripeError.message : String(stripeError) 
        });
        // Don't throw - payout will be processed manually or seller needs to connect Stripe
      }
    } else {
      logStep("Seller has no Stripe account connected, payout pending manual processing");
    }

    // Create notification for seller
    await supabaseClient.from("notifications").insert({
      user_id: order.seller_id,
      type: "payout",
      title: payoutStatus === "completed" ? "Plată Primită!" : "Livrare Confirmată",
      message: payoutStatus === "completed" 
        ? `Plata de £${netAmount.toFixed(2)} a fost transferată în contul tău Stripe.`
        : `Livrarea a fost confirmată! Conectează-ți contul Stripe în Setări pentru a primi plata de £${netAmount.toFixed(2)}.`,
      data: { orderId: order_id, payoutId: payout.id, amount: netAmount },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: payoutStatus === "completed" 
          ? "Livrare confirmată, transfer Stripe efectuat"
          : "Livrare confirmată, plata în așteptare (conectează Stripe)",
        payout: {
          id: payout.id,
          gross_amount: grossAmount,
          buyer_fee: buyerFee,
          seller_commission: sellerCommission,
          net_amount: netAmount,
          status: payoutStatus,
          stripe_transfer_id: stripeTransferId,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
