import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefundRequest {
  order_id: string;
  reason: string;
  amount?: number;
}

interface OrderData {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  amount: number;
  status: string;
  payout_status: string;
  payout_amount: number;
  payment_processor: string;
  listings: { title: string } | null;
}

// Maximum refund window in days
const MAX_REFUND_WINDOW_DAYS = 14;
// Maximum refund requests per user per 24 hours
const MAX_REQUESTS_PER_DAY = 3;

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

    if (reason.trim().length < 10) {
      throw new Error("Reason must be at least 10 characters");
    }

    // Get order details
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*, listings(title)")
      .eq("id", order_id)
      .single();

    if (orderError || !orderData) {
      throw new Error("Order not found");
    }

    const order = orderData as OrderData;

    // Check admin status
    const { data: isAdmin } = await supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" });

    const isBuyer = order.buyer_id === user.id;

    // ADMIN PROCESSING - Full refund authority
    if (isAdmin) {
      return await processAdminRefund(supabase, user, order, reason, amount);
    }

    // NON-ADMIN: Only buyers can request refunds
    if (!isBuyer) {
      throw new Error("Only buyers can request refunds");
    }

    // Check if already refunded
    if (order.status === "refunded") {
      throw new Error("Order already refunded");
    }

    // Check for existing pending refund request
    const { data: existingRefund } = await supabase
      .from("refunds")
      .select("id, status")
      .eq("order_id", order_id)
      .in("status", ["pending", "processing"])
      .maybeSingle();

    if (existingRefund) {
      throw new Error("A refund request is already pending for this order");
    }

    // Check refund time window
    const { data: orderCreated } = await supabase
      .from("orders")
      .select("created_at")
      .eq("id", order_id)
      .single();

    const orderDate = new Date(orderCreated?.created_at || Date.now());
    const now = new Date();
    const daysSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceOrder > MAX_REFUND_WINDOW_DAYS) {
      throw new Error(`Refund window expired. Refunds must be requested within ${MAX_REFUND_WINDOW_DAYS} days.`);
    }

    // Check order status eligibility
    const eligibleStatuses = ["pending", "paid", "shipped", "delivered"];
    if (!eligibleStatuses.includes(order.status)) {
      throw new Error(`Order status "${order.status}" is not eligible for refund`);
    }

    // Rate limiting: Check requests in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentRequestsCount } = await supabase
      .from("refunds")
      .select("*", { count: "exact", head: true })
      .eq("requested_by", user.id)
      .gte("created_at", oneDayAgo);

    if (recentRequestsCount && recentRequestsCount >= MAX_REQUESTS_PER_DAY) {
      throw new Error(`Too many refund requests. Maximum ${MAX_REQUESTS_PER_DAY} requests per 24 hours.`);
    }

    // Calculate refund amount
    const refundAmount = amount || order.amount;
    if (refundAmount > order.amount) {
      throw new Error("Refund amount cannot exceed order amount");
    }

    // Create refund request with PENDING status
    const refundTransactionId = `REF-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const { error: refundError } = await supabase.from("refunds").insert({
      order_id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      amount: refundAmount,
      reason,
      status: "pending",
      requested_by: user.id,
      requires_admin_approval: true,
      processor: order.payment_processor,
      processor_refund_id: refundTransactionId,
    });

    if (refundError) throw refundError;

    // Update order with refund request info
    await supabase
      .from("orders")
      .update({
        refund_status: "pending_approval",
        refund_amount: refundAmount,
        refund_reason: reason,
        refund_requested_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    const listingTitle = order.listings?.title || "Produs";

    // Notify buyer
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "refund_requested",
      title: "Cerere de Rambursare Trimisă",
      message: `Cererea ta de rambursare de ${refundAmount.toFixed(2)} RON pentru "${listingTitle}" așteaptă aprobare.`,
      data: { order_id, refund_amount: refundAmount, status: "pending_approval" },
    });

    // Notify seller
    await supabase.from("notifications").insert({
      user_id: order.seller_id,
      type: "refund_requested",
      title: "Cerere de Rambursare Primită",
      message: `Cumpărătorul a solicitat rambursare pentru "${listingTitle}". Un administrator va revizui.`,
      data: { order_id, refund_amount: refundAmount },
    });

    // Log in audit
    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "refund_requested",
      entity_type: "order",
      entity_id: order_id,
      old_values: { status: order.status },
      new_values: { refund_status: "pending_approval", refund_amount: refundAmount, reason },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cererea de rambursare a fost trimisă și așteaptă aprobare",
        refund: {
          transaction_id: refundTransactionId,
          amount: refundAmount,
          status: "pending_approval",
          requires_admin_approval: true,
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

// Admin-only refund processing
async function processAdminRefund(
  // deno-lint-ignore no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  admin: { id: string },
  order: OrderData,
  reason: string,
  amount?: number
) {
  console.log(`[ADMIN REFUND] Admin ${admin.id} processing refund for order ${order.id}`);

  const refundAmount = amount || order.amount;
  const isPartialRefund = amount && amount < order.amount;
  const newStatus = isPartialRefund ? "partially_refunded" : "refunded";
  const refundTransactionId = `REF-ADMIN-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Update order status
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: newStatus,
      refund_status: "completed",
      refund_amount: refundAmount,
      refund_reason: reason,
      refund_requested_at: new Date().toISOString(),
      refund_transaction_id: refundTransactionId,
      refunded_by: admin.id,
      refunded_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) throw updateError;

  // Update or create refund record
  const { data: existingRefund } = await supabase
    .from("refunds")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (existingRefund) {
    await supabase.from("refunds")
      .update({
        status: "completed",
        approved_by: admin.id,
        approved_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq("id", existingRefund.id);
  } else {
    await supabase.from("refunds").insert({
      order_id: order.id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      amount: refundAmount,
      reason,
      status: "completed",
      requested_by: admin.id,
      approved_by: admin.id,
      approved_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      processor: order.payment_processor,
      processor_refund_id: refundTransactionId,
    });
  }

  // Reverse seller payout if pending
  if (order.payout_status === "pending") {
    await supabase.rpc("admin_increment_pending_balance", {
      p_user_id: order.seller_id,
      p_amount: -(order.payout_amount || 0),
    });

    await supabase
      .from("seller_payouts")
      .update({ status: "cancelled", cancelled_reason: `Refund by admin: ${reason}` })
      .eq("order_id", order.id);
  }

  // Re-activate listing
  await supabase
    .from("listings")
    .update({ is_sold: false, is_active: true })
    .eq("id", order.listing_id);

  const listingTitle = order.listings?.title || "Produs";

  // Notify buyer
  await supabase.from("notifications").insert({
    user_id: order.buyer_id,
    type: "refund_approved",
    title: "Rambursare Aprobată! ✅",
    message: `Rambursarea de ${refundAmount.toFixed(2)} RON pentru "${listingTitle}" a fost procesată.`,
    data: { order_id: order.id, refund_amount: refundAmount },
  });

  // Notify seller
  await supabase.from("notifications").insert({
    user_id: order.seller_id,
    type: "refund_approved",
    title: "Comandă Rambursată",
    message: `Comanda pentru "${listingTitle}" a fost rambursată: ${reason}`,
    data: { order_id: order.id, refund_amount: refundAmount },
  });

  // Log in audit
  await supabase.from("audit_logs").insert({
    admin_id: admin.id,
    action: "refund_approved_by_admin",
    entity_type: "order",
    entity_id: order.id,
    old_values: { status: order.status },
    new_values: { status: newStatus, refund_amount: refundAmount, reason },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Rambursare procesată cu succes de administrator",
      refund: {
        transaction_id: refundTransactionId,
        amount: refundAmount,
        status: "completed",
        approved_by: admin.id,
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
