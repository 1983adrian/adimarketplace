import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYPAL_API = Deno.env.get("PAYPAL_CLIENT_ID")?.startsWith("A")
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secretKey = Deno.env.get("PAYPAL_SECRET_KEY");

  if (!clientId || !secretKey) {
    throw new Error("PayPal credentials not configured");
  }

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${secretKey}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal auth failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
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

    const { action } = await req.json();

    if (action === "create-referral") {
      // Create Partner Referral link for seller onboarding
      const accessToken = await getPayPalAccessToken();
      
      const returnUrl = req.headers.get("origin") || "https://marketplaceromania.lovable.app";

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
          return_url: `${returnUrl}/store/${user.id}?paypal=success`,
          return_url_description: "Înapoi la magazinul tău",
          action_renewal_url: `${returnUrl}/store/${user.id}?paypal=retry`,
        },
      };

      const response = await fetch(
        `${PAYPAL_API}/v2/customer/partner-referrals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(referralBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PayPal referral error:", errorText);
        throw new Error(`PayPal API error: ${response.status}`);
      }

      const referralData = await response.json();
      
      // Find the action_url (where seller signs up)
      const actionUrl = referralData.links?.find(
        (l: any) => l.rel === "action_url"
      )?.href;

      if (!actionUrl) {
        throw new Error("No action URL returned from PayPal");
      }

      return new Response(
        JSON.stringify({
          success: true,
          action_url: actionUrl,
          referral_id: referralData.links?.find((l: any) => l.rel === "self")?.href,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "check-status") {
      // Check if seller's PayPal merchant account is connected
      const accessToken = await getPayPalAccessToken();
      const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;

      const response = await fetch(
        `${PAYPAL_API}/v1/customer/partners/${clientId}/merchant-integrations/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        // Not connected yet
        return new Response(
          JSON.stringify({ connected: false }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const merchantData = await response.json();
      const isConnected =
        merchantData.payments_receivable === true &&
        merchantData.primary_email_confirmed === true;

      // If connected, save merchant_id and email to profile
      if (isConnected && merchantData.merchant_id) {
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const adminClient = createClient(supabaseUrl, serviceRoleKey);

        await adminClient
          .from("profiles")
          .update({
            paypal_email: merchantData.primary_email || merchantData.tracking_id,
          } as any)
          .eq("user_id", user.id);
      }

      return new Response(
        JSON.stringify({
          connected: isConnected,
          merchant_id: merchantData.merchant_id || null,
          payments_receivable: merchantData.payments_receivable || false,
          email_confirmed: merchantData.primary_email_confirmed || false,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("PayPal onboard error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
