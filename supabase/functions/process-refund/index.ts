import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefundRequest {
  order_id: string;
  reason: string;
  amount?: number; // Partial refund amount, if not provided = full refund
}

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

    const body: RefundRequest = await req.json();
    const { order_id, reason, amount } = body;

    if (!order_id || !reason) {
      throw new Error("Order ID and reason are required");
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, listings(title)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Check permissions - admin, seller, or buyer
    const { data: isAdmin } = await supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" });

    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.seller_id === user.id;

    if (!isAdmin && !isBuyer && !isSeller) {
      throw new Error("Not authorized to refund this order");
    }

    // Check if already refunded
    if (order.status === "refunded") {
      throw new Error("Order already refunded");
    }

    // Calculate refund amount
    const refundAmount = amount || order.amount;
    const isPartialRefund = amount && amount < order.amount;

    // Create refund record
    const refundTransactionId = `REF-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: isPartialRefund ? "partially_refunded" : "refund_pending",
        refund_status: "processing",
        refund_amount: refundAmount,
        refund_reason: reason,
        refund_requested_at: new Date().toISOString(),
        refund_transaction_id: refundTransactionId,
        refunded_by: user.id,
      })
      .eq("id", order_id);

    if (updateError) throw updateError;

    // Create refund record in dedicated table
    await supabase.from("refunds").insert({
      order_id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      amount: refundAmount,
      reason,
      status: "processing",
      requested_by: user.id,
      processor: order.payment_processor,
      processor_refund_id: refundTransactionId,
    });

    // Reverse seller payout if not yet paid out
    if (order.payout_status === "pending") {
      // Reduce pending balance
      await supabase.rpc("increment_pending_balance", {
        p_user_id: order.seller_id,
        p_amount: -(order.payout_amount || 0),
      });

      // Update seller payout record
      await supabase
        .from("seller_payouts")
        .update({ status: "cancelled", cancelled_reason: `Refund: ${reason}` })
        .eq("order_id", order_id);
    }

    // Re-activate listing
    await supabase
      .from("listings")
      .update({ is_sold: false, is_active: true })
      .eq("id", order.listing_id);

    // Notify buyer
    await supabase.from("notifications").insert({
      user_id: order.buyer_id,
      type: "refund_initiated",
      title: "Rambursare Inițiată",
      message: `Rambursare de £${refundAmount.toFixed(2)} pentru "${order.listings?.title}" este în procesare.`,
      data: { order_id, refund_amount: refundAmount },
    });

    // Notify seller
    await supabase.from("notifications").insert({
      user_id: order.seller_id,
      type: "refund_initiated",
      title: "Comandă Rambursată",
      message: `Comanda pentru "${order.listings?.title}" a fost rambursată: ${reason}`,
      data: { order_id, refund_amount: refundAmount },
    });

    // Log in audit
    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "refund_initiated",
      entity_type: "order",
      entity_id: order_id,
      old_values: { status: order.status },
      new_values: { 
        status: isPartialRefund ? "partially_refunded" : "refund_pending",
        refund_amount: refundAmount,
        reason,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Rambursare inițiată cu succes",
        refund: {
          transaction_id: refundTransactionId,
          amount: refundAmount,
          status: "processing",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Refund processing error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
