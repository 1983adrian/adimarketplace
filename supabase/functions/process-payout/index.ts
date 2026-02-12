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

    // CRITICAL: Tracking must be provided before payout
    if (!order.tracking_number || !order.carrier) {
      throw new Error("Vânzătorul nu a adăugat încă numărul de tracking. Contactează-l pentru detalii.");
    }

    // Check for active disputes
    if (order.dispute_opened_at && !order.dispute_resolved_at) {
      throw new Error("Există o dispută activă pentru această comandă. Plata este blocată până la rezolvare.");
    }

    // Get seller profile for balance info
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("payout_balance, pending_balance, paypal_email")
      .eq("user_id", order.seller_id)
      .single();

    const payoutAmount = order.payout_amount || order.amount; // 0% commission

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        delivery_confirmed_at: new Date().toISOString(),
        payout_status: "ready",
      })
      .eq("id", order_id);

    if (updateError) throw updateError;

    // Update seller payout record
    await supabase
      .from("seller_payouts")
      .update({
        status: "ready",
        processed_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);

    // Move funds from pending to payout balance
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
      title: "Fonduri Disponibile!",
      message: `Cumpărătorul a confirmat livrarea. ${payoutAmount.toFixed(2)} RON sunt disponibili pentru retragere.`,
      data: { 
        order_id: order.id, 
        amount: payoutAmount,
      },
    });

    // Audit log for payout
    await supabase.from("financial_audit_log").insert({
      user_id: user.id,
      action: "delivery_confirmed_payout_ready",
      entity_type: "order",
      entity_id: order_id,
      amount: payoutAmount,
      new_value: {
        seller_id: order.seller_id,
        payout_status: "ready_for_withdrawal",
        tracking_number: order.tracking_number,
        carrier: order.carrier,
      },
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      user_agent: req.headers.get("user-agent"),
    });

    // NOTE: Actual PayPal payout is NOT automated yet.
    // Seller must request withdrawal manually from Wallet page.
    // Admin processes the payout manually via PayPal.

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
        message: "Livrare confirmată! Fondurile sunt disponibile pentru retragere.",
        payout: {
          net_amount: payoutAmount,
          status: "ready_for_withdrawal",
          note: "Vânzătorul poate solicita retragerea din pagina Portofel.",
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
