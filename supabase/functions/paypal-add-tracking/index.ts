import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-TRACKING] ${step}${detailsStr}`);
};

// Get PayPal credentials from DB (same pattern as process-payment & verify-payment)
async function getPayPalConfig(supabase: any) {
  const { data, error } = await supabase
    .from("payment_processor_settings")
    .select("*")
    .eq("processor_name", "paypal")
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  if (!data.api_key_encrypted || !data.api_secret_encrypted) return null;

  return {
    clientId: data.api_key_encrypted,
    clientSecret: data.api_secret_encrypted,
    environment: data.environment || "sandbox",
  };
}

// Get PayPal access token using DB config
async function getPayPalAccessToken(config: { clientId: string; clientSecret: string; environment: string }): Promise<{ accessToken: string; baseUrl: string }> {
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
    const error = await response.text();
    throw new Error(`PayPal auth failed: ${error}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token, baseUrl };
}

// Map carrier names to PayPal carrier enum
function mapCarrierToPayPal(carrier: string): string {
  const mapping: Record<string, string> = {
    royal_mail: "ROYAL_MAIL",
    dhl: "DHL",
    ups: "UPS",
    fedex: "FEDEX",
    hermes: "GLS",
    dpd: "DPD_UK",
    yodel: "YODEL",
    fan_courier: "OTHER",
    sameday: "OTHER",
    cargus: "OTHER",
    gls: "GLS",
    other: "OTHER",
  };
  return mapping[carrier] || "OTHER";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { order_id, tracking_number, carrier, transaction_id } = await req.json();

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

    // Get seller's PayPal email
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("paypal_email, display_name")
      .eq("user_id", order.seller_id)
      .single();

    if (!sellerProfile?.paypal_email) {
      logStep("Seller has no PayPal email, skipping");
      return new Response(
        JSON.stringify({ success: false, message: "Seller has no PayPal linked" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Seller PayPal found", { email: sellerProfile.paypal_email });

    // Get PayPal config from DB (consistent with process-payment & verify-payment)
    const paypalConfig = await getPayPalConfig(supabase);
    if (!paypalConfig) {
      logStep("PayPal not configured in admin panel, skipping");
      return new Response(
        JSON.stringify({ success: false, message: "PayPal not configured by admin" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get PayPal access token
    const { accessToken, baseUrl } = await getPayPalAccessToken(paypalConfig);
    logStep("PayPal access token obtained");

    const trackingData = {
      trackers: [
        {
          transaction_id: transaction_id || order.processor_transaction_id || order_id,
          tracking_number: tracking_number || order.tracking_number,
          status: "SHIPPED",
          carrier: mapCarrierToPayPal(carrier || order.carrier || "other"),
        },
      ],
    };

    logStep("Sending tracking to PayPal", trackingData);

    const response = await fetch(`${baseUrl}/v1/shipping/trackers-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(trackingData),
    });

    const result = await response.json();
    logStep("PayPal response", { status: response.status, result });

    if (!response.ok) {
      // Log but don't fail - PayPal tracking is supplementary
      logStep("PayPal tracking failed but continuing", result);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "PayPal tracking submission failed",
          details: result,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Notify seller that tracking was sent to PayPal
    await supabase.from("notifications").insert({
      user_id: order.seller_id,
      type: "system",
      title: "📦 Tracking trimis la PayPal",
      message: `Numărul de tracking ${tracking_number || order.tracking_number} a fost trimis la PayPal pentru protecția ta.`,
      data: { order_id, paypal_status: "sent" } as any,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Tracking sent to PayPal" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
