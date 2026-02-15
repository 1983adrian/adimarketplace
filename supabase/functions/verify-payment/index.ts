import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get PayPal credentials from environment secrets
function getPayPalConfig() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_SECRET_KEY");

  if (!clientId || !clientSecret) return null;

  return {
    clientId,
    clientSecret,
    environment: "live" as const,
  };
}

// Get PayPal access token
async function getPayPalAccessToken(config: { clientId: string; clientSecret: string; environment: string }) {
  const baseUrl = config.environment === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("PayPal authentication failed");
  }

  const data = await response.json();
  return { accessToken: data.access_token, baseUrl };
}

// Capture PayPal order
async function capturePayPalOrder(accessToken: string, baseUrl: string, paypalOrderId: string) {
  const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("PayPal capture failed:", result);
    throw new Error(result.message || "PayPal capture failed");
  }

  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { orderIds, invoiceNumber, paypalOrderId } = await req.json();

    if (!orderIds || orderIds.length === 0) {
      throw new Error("No order IDs provided");
    }

    if (!userId) {
      throw new Error("Authentication required");
    }

    // Rate limiting: max 15 verification attempts per hour per user
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: recentAttempts } = await supabase
      .from("financial_audit_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action", "payment_verification")
      .gte("created_at", oneHourAgo);

    if (recentAttempts && recentAttempts > 15) {
      return new Response(
        JSON.stringify({ success: false, error: "Prea multe încercări de verificare. Încearcă din nou mai târziu." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Log verification attempt
    await supabase.from("financial_audit_log").insert({
      user_id: userId,
      action: "payment_verification",
      entity_type: "payment",
      entity_id: paypalOrderId || orderIds?.[0],
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      user_agent: req.headers.get("user-agent"),
    });

    // Get orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .in("id", orderIds)
      .eq("buyer_id", userId);

    if (ordersError || !orders || orders.length === 0) {
      throw new Error("Orders not found");
    }

    // Check if already processed
    const pendingOrders = orders.filter(o => o.status === "payment_pending");
    
    if (pendingOrders.length === 0) {
      const allConfirmed = orders.every(o => o.status !== "cancelled");
      return new Response(
        JSON.stringify({
          success: true,
          paymentConfirmed: allConfirmed,
          status: allConfirmed ? "confirmed" : "failed",
          orders: orders.map(o => ({ id: o.id, status: o.status, amount: o.amount })),
          message: allConfirmed ? "Toate comenzile au fost deja confirmate" : "Unele comenzi au fost anulate",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── PayPal Capture ───
    if (paypalOrderId) {
      const paypalConfig = getPayPalConfig();
      if (!paypalConfig) {
        throw new Error("PayPal nu este configurat");
      }

      const { accessToken, baseUrl } = await getPayPalAccessToken(paypalConfig);
      
      try {
        const captureResult = await capturePayPalOrder(accessToken, baseUrl, paypalOrderId);
        console.log("PayPal capture result:", JSON.stringify(captureResult));

        const captureStatus = captureResult.status;
        
        if (captureStatus === "COMPLETED") {
          // Get capture transaction ID
          const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
          const captureId = capture?.id || paypalOrderId;
          const capturedAmount = capture?.amount?.value;

          // Confirm all orders
          for (const order of pendingOrders) {
            await supabase.rpc("confirm_order_payment", {
              p_order_id: order.id,
              p_transaction_id: captureId,
              p_processor_status: "paypal_captured",
            });

            // Update order with PayPal details
            await supabase
              .from("orders")
              .update({
                processor_transaction_id: captureId,
                processor_status: "paypal_captured",
                payment_processor: "paypal",
              })
              .eq("id", order.id);
          }

          // Update invoice
          if (invoiceNumber) {
            await supabase
              .from("invoices")
              .update({ status: "paid", paid_at: new Date().toISOString() })
              .eq("invoice_number", invoiceNumber);
          }

          return new Response(
            JSON.stringify({
              success: true,
              paymentConfirmed: true,
              status: "confirmed",
              paypalOrderId,
              captureId,
              amount: capturedAmount,
              results: pendingOrders.map(o => ({
                orderId: o.id,
                success: true,
                status: "confirmed",
                amount: o.amount,
              })),
              message: "Plata PayPal a fost confirmată cu succes!",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          // Payment not completed - cancel orders
          for (const order of pendingOrders) {
            await supabase.rpc("cancel_pending_order", {
              p_order_id: order.id,
              p_reason: `PayPal status: ${captureStatus}`,
            });
          }

          if (invoiceNumber) {
            await supabase.from("invoices").update({ status: "cancelled" }).eq("invoice_number", invoiceNumber);
          }

          return new Response(
            JSON.stringify({
              success: false,
              paymentConfirmed: false,
              status: "failed",
              message: `Plata PayPal nu a fost finalizată (status: ${captureStatus}).`,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (captureError: any) {
        console.error("PayPal capture error:", captureError);

        // Check if already captured (duplicate capture attempt)
        if (captureError.message?.includes("ORDER_ALREADY_CAPTURED")) {
          // Already captured - mark as confirmed
          for (const order of pendingOrders) {
            await supabase.rpc("confirm_order_payment", {
              p_order_id: order.id,
              p_transaction_id: paypalOrderId,
              p_processor_status: "paypal_captured",
            });
          }
          if (invoiceNumber) {
            await supabase.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("invoice_number", invoiceNumber);
          }

          return new Response(
            JSON.stringify({
              success: true,
              paymentConfirmed: true,
              status: "confirmed",
              message: "Plata a fost deja confirmată.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        throw captureError;
      }
    }

    // ─── No PayPal order ID - cancel pending orders ───
    for (const order of pendingOrders) {
      await supabase.rpc("cancel_pending_order", {
        p_order_id: order.id,
        p_reason: "Plata nu a fost finalizată",
      });
    }

    if (invoiceNumber) {
      await supabase.from("invoices").update({ status: "cancelled" }).eq("invoice_number", invoiceNumber);
    }

    return new Response(
      JSON.stringify({
        success: false,
        paymentConfirmed: false,
        status: "failed",
        message: "Plata nu a fost finalizată. Folosește Ramburs (COD) sau încearcă din nou.",
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