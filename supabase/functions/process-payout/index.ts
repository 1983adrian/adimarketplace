import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { order_id } = await req.json();
    if (!order_id) throw new Error("Order ID is required");
    logStep("Processing order", { orderId: order_id });

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
      if (fee.fee_type === "buyer_service_fee") {
        buyerFee = fee.is_percentage ? (grossAmount * Number(fee.amount) / 100) : Number(fee.amount);
      } else if (fee.fee_type === "seller_commission") {
        sellerCommission = fee.is_percentage ? (grossAmount * Number(fee.amount) / 100) : Number(fee.amount);
      }
    }

    // Net amount to seller = gross - seller commission
    // Buyer fee was already added to the total at checkout
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

    // TODO: In a real scenario, you would trigger a PayPal payout here
    // For now, we mark it as pending for manual processing by admin

    return new Response(
      JSON.stringify({
        success: true,
        message: "Delivery confirmed, payout pending",
        payout: {
          id: payout.id,
          gross_amount: grossAmount,
          buyer_fee: buyerFee,
          seller_commission: sellerCommission,
          net_amount: netAmount,
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
