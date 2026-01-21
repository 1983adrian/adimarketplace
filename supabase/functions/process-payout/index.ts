import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      throw new Error("Invalid token");
    }

    const { order_id } = await req.json();

    if (!order_id) {
      throw new Error("Order ID is required");
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Verify buyer is confirming
    if (order.buyer_id !== user.id) {
      throw new Error("Only the buyer can confirm delivery");
    }

    // Check if already confirmed
    if (order.delivery_confirmed_at) {
      throw new Error("Delivery already confirmed");
    }

    // Get seller profile for payout details
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("iban, card_number_last4, card_holder_name, payout_method, payout_balance, pending_balance")
      .eq("user_id", order.seller_id)
      .single();

    const payoutAmount = order.payout_amount || (order.amount * 0.9); // 10% commission fallback

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        delivery_confirmed_at: new Date().toISOString(),
        payout_status: "processing",
      })
      .eq("id", order_id);

    if (updateError) throw updateError;

    // Update seller payout record
    await supabase
      .from("seller_payouts")
      .update({
        status: "processing",
        processed_at: new Date().toISOString(),
        payout_method: sellerProfile?.payout_method || "iban",
      })
      .eq("order_id", order_id);

    // Move funds from pending to payout balance
    // First, reduce pending balance
    const { error: pendingError } = await supabase
      .from("profiles")
      .update({
        pending_balance: Math.max(0, (sellerProfile?.pending_balance || 0) - payoutAmount),
        payout_balance: (sellerProfile?.payout_balance || 0) + payoutAmount,
      })
      .eq("user_id", order.seller_id);

    if (pendingError) {
      console.error("Balance update error:", pendingError);
    }

    // Create notification for seller
    await supabase.from("notifications").insert({
      user_id: order.seller_id,
      type: "payout_ready",
      title: "Plată Disponibilă!",
      message: `Cumpărătorul a confirmat livrarea. £${payoutAmount.toFixed(2)} au fost adăugate la soldul tău disponibil.`,
      data: { 
        order_id: order.id, 
        amount: payoutAmount,
        payout_method: sellerProfile?.payout_method || "iban",
      },
    });

    // Create payout entry in payouts table for tracking
    await supabase.from("payouts").insert({
      order_id: order.id,
      seller_id: order.seller_id,
      gross_amount: order.amount,
      net_amount: payoutAmount,
      buyer_fee: order.buyer_fee || 2,
      seller_commission: order.seller_commission || (order.amount * 0.1),
      status: "completed",
      processed_at: new Date().toISOString(),
    });

    // Update invoice status
    await supabase
      .from("invoices")
      .update({ 
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Livrare confirmată cu succes!",
        payout: {
          net_amount: payoutAmount,
          method: sellerProfile?.payout_method || "iban",
          status: "completed",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Payout processing error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
