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

    // CRITICAL SECURITY: DOAR administratorii pot procesa refunds
    const { data: isAdmin } = await supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" });

    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.seller_id === user.id;

    // Check if already refunded
    if (order.status === "refunded") {
      throw new Error("Order already refunded");
    }

    // Calculate refund amount
    const refundAmount = amount || order.amount;
    const isPartialRefund = amount && amount < order.amount;

    // Create refund record
    const refundTransactionId = `REF-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // SECURITY: Utilizatorii normali pot DOAR cere refund (status pending)
    // DOAR administratorii pot procesa efectiv refund-ul
    if (!isAdmin) {
      // Utilizator normal - creează cerere de refund cu status PENDING
      if (!isBuyer && !isSeller) {
        throw new Error("Not authorized to request refund for this order");
      }

      // Creează doar cererea, fără a modifica ordinea sau balanța
      const { error: refundError } = await supabase.from("refunds").insert({
        order_id,
        buyer_id: order.buyer_id,
        seller_id: order.seller_id,
        amount: refundAmount,
        reason,
        status: "pending", // PENDING - necesită aprobare admin
        requested_by: user.id,
        requires_admin_approval: true,
        processor: order.payment_processor,
        processor_refund_id: refundTransactionId,
      });

      if (refundError) throw refundError;

      // Update order cu cererea de refund, dar NU schimbăm status-ul principal
      await supabase
        .from("orders")
        .update({
          refund_status: "pending_approval",
          refund_amount: refundAmount,
          refund_reason: reason,
          refund_requested_at: new Date().toISOString(),
        })
        .eq("id", order_id);

      // Notifică adminii despre cererea de refund
      const { data: adminEmails } = await supabase
        .from("admin_emails")
        .select("email")
        .eq("is_active", true);

      // Notifică utilizatorul care a cerut refund
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "refund_requested",
        title: "Cerere de Rambursare Trimisă",
        message: `Cererea ta de rambursare de ${refundAmount.toFixed(2)} RON pentru "${order.listings?.title}" a fost trimisă și așteaptă aprobarea unui administrator.`,
        data: { order_id, refund_amount: refundAmount, status: "pending_approval" },
      });

      // Log cererea în audit
      await supabase.from("audit_logs").insert({
        admin_id: user.id,
        action: "refund_requested",
        entity_type: "order",
        entity_id: order_id,
        old_values: { status: order.status },
        new_values: { 
          refund_status: "pending_approval",
          refund_amount: refundAmount,
          reason,
          requires_admin_approval: true,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Cererea de rambursare a fost trimisă și așteaptă aprobarea unui administrator",
          refund: {
            transaction_id: refundTransactionId,
            amount: refundAmount,
            status: "pending_approval",
            requires_admin_approval: true,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ADMIN ONLY: Procesare efectivă a refund-ului
    console.log(`[ADMIN REFUND] Admin ${user.id} processing refund for order ${order_id}`);

    // Update order status
    const newStatus = isPartialRefund ? "partially_refunded" : "refunded";
    
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        refund_status: "processing",
        refund_amount: refundAmount,
        refund_reason: reason,
        refund_requested_at: new Date().toISOString(),
        refund_transaction_id: refundTransactionId,
        refunded_by: user.id,
        refunded_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) throw updateError;

    // Update sau creează refund record
    const { data: existingRefund } = await supabase
      .from("refunds")
      .select("id")
      .eq("order_id", order_id)
      .single();

    if (existingRefund) {
      await supabase.from("refunds")
        .update({
          status: "processing",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", existingRefund.id);
    } else {
      await supabase.from("refunds").insert({
        order_id,
        buyer_id: order.buyer_id,
        seller_id: order.seller_id,
        amount: refundAmount,
        reason,
        status: "processing",
        requested_by: user.id,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        processor: order.payment_processor,
        processor_refund_id: refundTransactionId,
      });
    }

    // Reverse seller payout if not yet paid out
    if (order.payout_status === "pending") {
      // Reduce pending balance - folosim funcția admin
      await supabase.rpc("admin_increment_pending_balance", {
        p_user_id: order.seller_id,
        p_amount: -(order.payout_amount || 0),
      });

      // Update seller payout record
      await supabase
        .from("seller_payouts")
        .update({ status: "cancelled", cancelled_reason: `Refund aprobat de admin: ${reason}` })
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
      type: "refund_approved",
      title: "Rambursare Aprobată! ✅",
      message: `Rambursarea de ${refundAmount.toFixed(2)} RON pentru "${order.listings?.title}" a fost aprobată și este în procesare.`,
      data: { order_id, refund_amount: refundAmount },
    });

    // Notify seller
    await supabase.from("notifications").insert({
      user_id: order.seller_id,
      type: "refund_approved",
      title: "Comandă Rambursată",
      message: `Comanda pentru "${order.listings?.title}" a fost rambursată de admin: ${reason}`,
      data: { order_id, refund_amount: refundAmount },
    });

    // Log in audit
    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "refund_approved_by_admin",
      entity_type: "order",
      entity_id: order_id,
      old_values: { status: order.status },
      new_values: { 
        status: newStatus,
        refund_amount: refundAmount,
        reason,
        approved_by: user.id,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Rambursare procesată cu succes de administrator",
        refund: {
          transaction_id: refundTransactionId,
          amount: refundAmount,
          status: "processing",
          approved_by: user.id,
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
