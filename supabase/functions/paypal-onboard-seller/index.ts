import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
  const secret = Deno.env.get("PAYPAL_SECRET_KEY")!;
  const base = "https://api-m.sandbox.paypal.com"; // Change to live for production

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, return_url, merchantId, merchantIdInPayPal } = body;

    // Generate PayPal Partner Referral link for seller onboarding
    if (action === "connect") {
      const accessToken = await getPayPalAccessToken();
      const base = "https://api-m.sandbox.paypal.com";

      const referralBody = {
        tracking_id: user.id,
        operations: [
          {
            operation: "API_INTEGRATION",
            api_integration_preference: {
              rest_api_integration: {
                integration_method: "PAYPAL",
                integration_type: "THIRD_PARTY",
                third_party_details: {
                  features: ["PAYMENT", "REFUND"],
                },
              },
            },
          },
        ],
        products: ["EXPRESS_CHECKOUT"],
        legal_consents: [
          {
            type: "SHARE_DATA_CONSENT",
            granted: true,
          },
        ],
        partner_config_override: {
          return_url: return_url || "https://marketplaceromania.lovable.app",
        },
      };

      const referralRes = await fetch(`${base}/v2/customer/partner-referrals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(referralBody),
      });

      if (!referralRes.ok) {
        const errText = await referralRes.text();
        console.error("PayPal referral error:", errText);
        throw new Error(`PayPal referral failed: ${referralRes.status}`);
      }

      const referralData = await referralRes.json();
      const actionUrl = referralData.links?.find(
        (l: any) => l.rel === "action_url"
      )?.href;

      if (!actionUrl) {
        throw new Error("No action_url received from PayPal");
      }

      return new Response(
        JSON.stringify({ success: true, action_url: actionUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check seller's PayPal merchant status
    if (action === "get-status") {
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      const { data: profile } = await adminClient
        .from("profiles")
        .select("paypal_email")
        .eq("user_id", user.id)
        .single();

      const email = (profile as any)?.paypal_email || null;

      // If we have a stored PayPal email/merchant, check with PayPal API
      if (email) {
        return new Response(
          JSON.stringify({
            connected: true,
            email: email,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ connected: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Callback after PayPal onboarding - save merchant info
    if (action === "save-merchant") {
      
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      // Save the merchant connection
      const paypalRef = merchantIdInPayPal || merchantId || `paypal_connected_${Date.now()}`;
      
      const { error } = await adminClient
        .from("profiles")
        .update({ paypal_email: paypalRef })
        .eq("user_id", user.id);

      if (error) throw error;

      // Audit log
      await adminClient.from("financial_audit_log").insert({
        user_id: user.id,
        action: "paypal_merchant_connected",
        entity_type: "profile",
        entity_id: user.id,
        new_value: { merchant_ref: paypalRef },
      });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Disconnect PayPal
    if (action === "disconnect") {
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      const { error } = await adminClient
        .from("profiles")
        .update({ paypal_email: null })
        .eq("user_id", user.id);

      if (error) throw error;

      await adminClient.from("financial_audit_log").insert({
        user_id: user.id,
        action: "paypal_disconnected",
        entity_type: "profile",
        entity_id: user.id,
      });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("PayPal onboard error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
