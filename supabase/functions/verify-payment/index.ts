import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  orderIds: string[];
  invoiceNumber?: string;
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
    const { orderIds, invoiceNumber } = body;

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

    // Check current order status
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

    // No card payment processor is currently integrated
    // Pending card payment orders cannot be verified
    // Cancel them and restore stock
    const results = [];

    for (const order of pendingOrders) {
      const { error: cancelError } = await supabase.rpc(
        "cancel_pending_order",
        {
          p_order_id: order.id,
          p_reason: "Procesatorul de plăți cu cardul nu este disponibil",
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

    // Update invoice status
    if (invoiceNumber) {
      await supabase
        .from("invoices")
        .update({ status: "cancelled" })
        .eq("invoice_number", invoiceNumber);
    }

    return new Response(
      JSON.stringify({
        success: false,
        paymentConfirmed: false,
        status: "failed",
        results,
        message: "Plata cu cardul nu este disponibilă momentan. Folosește Ramburs (COD).",
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
