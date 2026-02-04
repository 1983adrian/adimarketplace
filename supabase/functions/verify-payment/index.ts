import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  orderIds: string[];
  invoiceNumber?: string;
  // For demo mode - simulate payment result
  simulatePayment?: boolean;
  paymentSuccess?: boolean;
  failureReason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const body: VerifyPaymentRequest = await req.json();
    const { orderIds, invoiceNumber, simulatePayment, paymentSuccess, failureReason } = body;

    if (!orderIds || orderIds.length === 0) {
      throw new Error("No order IDs provided");
    }

    if (!userId) {
      throw new Error("Authentication required");
    }

    // Get orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .in("id", orderIds)
      .eq("buyer_id", userId);

    if (ordersError || !orders || orders.length === 0) {
      throw new Error("Orders not found");
    }

    // Check if any orders are still pending payment
    const pendingOrders = orders.filter(o => o.status === "payment_pending");
    
    if (pendingOrders.length === 0) {
      // All orders already processed
      const allConfirmed = orders.every(o => o.status !== "cancelled");
      return new Response(
        JSON.stringify({
          success: true,
          status: allConfirmed ? "confirmed" : "failed",
          orders: orders.map(o => ({
            id: o.id,
            status: o.status,
            amount: o.amount,
          })),
          message: allConfirmed 
            ? "Toate comenzile au fost deja confirmate" 
            : "Unele comenzi au fost anulate",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get MangoPay settings to check if we're in live mode
    const { data: mangopaySettings } = await supabase
      .from("payment_processor_settings")
      .select("*")
      .eq("processor_name", "mangopay")
      .maybeSingle();

    const hasLiveKeys = !!mangopaySettings?.api_key_encrypted;
    const isLiveMode = mangopaySettings?.environment === "live" && hasLiveKeys;

    // In live mode, verify payment with MangoPay
    // In demo mode, either simulate or auto-confirm
    let paymentConfirmed = false;
    let paymentError: string | null = null;

    if (isLiveMode) {
      // TODO: Actual MangoPay payment verification
      // For now, we'll return that payment needs to be verified externally
      return new Response(
        JSON.stringify({
          success: false,
          status: "awaiting_verification",
          message: "Așteptăm confirmarea plății de la procesatorul de plăți",
          pendingOrders: pendingOrders.map(o => o.id),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Demo mode - handle simulation or auto-confirm
    if (simulatePayment) {
      paymentConfirmed = paymentSuccess ?? true;
      paymentError = !paymentConfirmed ? (failureReason || "Payment declined") : null;
    } else {
      // In demo mode without explicit simulation, auto-confirm
      paymentConfirmed = true;
    }

    const results = [];

    for (const order of pendingOrders) {
      if (paymentConfirmed) {
        // Confirm the payment
        const { data: confirmResult, error: confirmError } = await supabase.rpc(
          "confirm_order_payment",
          {
            p_order_id: order.id,
            p_transaction_id: `DEMO-CONFIRMED-${Date.now()}`,
            p_processor_status: "confirmed",
          }
        );

        if (confirmError) {
          console.error("Error confirming order:", confirmError);
          results.push({
            orderId: order.id,
            success: false,
            error: confirmError.message,
          });
        } else {
          results.push({
            orderId: order.id,
            success: true,
            status: "confirmed",
          });
        }
      } else {
        // Cancel the order and restore stock
        const { data: cancelResult, error: cancelError } = await supabase.rpc(
          "cancel_pending_order",
          {
            p_order_id: order.id,
            p_reason: paymentError || "Payment failed",
          }
        );

        if (cancelError) {
          console.error("Error cancelling order:", cancelError);
          results.push({
            orderId: order.id,
            success: false,
            error: cancelError.message,
          });
        } else {
          results.push({
            orderId: order.id,
            success: true,
            status: "cancelled",
            stockRestored: true,
          });
        }
      }
    }

    // Update invoice status
    if (invoiceNumber) {
      await supabase
        .from("invoices")
        .update({ 
          status: paymentConfirmed ? "issued" : "cancelled",
          paid_at: paymentConfirmed ? new Date().toISOString() : null,
        })
        .eq("invoice_number", invoiceNumber);
    }

    const allSuccessful = results.every(r => r.success);
    const allConfirmed = results.every(r => r.status === "confirmed");

    return new Response(
      JSON.stringify({
        success: allSuccessful,
        paymentConfirmed,
        status: allConfirmed ? "confirmed" : (paymentConfirmed ? "partial" : "failed"),
        results,
        message: paymentConfirmed 
          ? "Plata a fost confirmată cu succes!" 
          : `Plata a eșuat: ${paymentError}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
