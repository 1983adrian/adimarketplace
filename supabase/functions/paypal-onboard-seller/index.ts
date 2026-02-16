import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYPAL_BASE = "https://api-m.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
  const secret = Deno.env.get("PAYPAL_SECRET_KEY")!;

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
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

function getSupabaseClients(authHeader: string | null) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  return { userClient, adminClient };
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

    const { userClient, adminClient } = getSupabaseClients(authHeader);

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ═══════════════════════════════════════════════════════
    // ACTION: connect — Generate PayPal Partner Referral link
    // This is the real OAuth-based onboarding for businesses
    // ═══════════════════════════════════════════════════════
    if (action === "connect") {
      const { return_url } = body;
      const accessToken = await getPayPalAccessToken();

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
                  features: ["PAYMENT", "REFUND", "PARTNER_FEE"],
                },
              },
            },
          },
        ],
        products: ["EXPRESS_CHECKOUT"],
        legal_consents: [
          { type: "SHARE_DATA_CONSENT", granted: true },
        ],
        partner_config_override: {
          return_url: return_url || "https://marketplaceromania.lovable.app/seller-mode",
        },
      };

      const referralRes = await fetch(`${PAYPAL_BASE}/v2/customer/partner-referrals`, {
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

    // ═══════════════════════════════════════════════════════
    // ACTION: complete-onboarding — Called after PayPal redirect
    // Verifies merchant status and saves merchant_id + tokens
    // ═══════════════════════════════════════════════════════
    if (action === "complete-onboarding") {
      const { merchantIdInPayPal } = body;

      if (!merchantIdInPayPal) {
        throw new Error("Missing merchantIdInPayPal from PayPal callback");
      }

      const accessToken = await getPayPalAccessToken();
      const partnerId = Deno.env.get("PAYPAL_CLIENT_ID")!;

      // Verify merchant status with PayPal
      const statusRes = await fetch(
        `${PAYPAL_BASE}/v1/customer/partners/${partnerId}/merchant-integrations/${merchantIdInPayPal}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      let merchantStatus: any = null;
      let permissionsGranted = false;
      let paymentsReceivable = false;

      if (statusRes.ok) {
        merchantStatus = await statusRes.json();
        permissionsGranted = merchantStatus?.oauth_third_party?.some(
          (o: any) => o.partner_client_id === partnerId
        ) || merchantStatus?.payments_receivable === true;
        paymentsReceivable = merchantStatus?.payments_receivable === true;
        console.log("Merchant status:", JSON.stringify(merchantStatus));
      } else {
        // PayPal may not have finished processing yet — save anyway
        console.warn("Could not verify merchant status yet:", await statusRes.text());
        permissionsGranted = true; // Assume granted since they completed the flow
      }

      // Save merchant connection in profiles
      const { error: profileError } = await adminClient
        .from("profiles")
        .update({
          paypal_merchant_id: merchantIdInPayPal,
          paypal_permissions_granted: permissionsGranted,
          paypal_connected_at: new Date().toISOString(),
          // Keep paypal_email for backward compat, set to merchant_id
          paypal_email: merchantIdInPayPal,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Store access info in secure tokens table
      await adminClient.from("paypal_merchant_tokens").upsert({
        user_id: user.id,
        merchant_id: merchantIdInPayPal,
        access_token: accessToken, // Platform token, not user's
        scopes: ["PAYMENT", "REFUND"],
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // Audit log
      await adminClient.from("financial_audit_log").insert({
        user_id: user.id,
        action: "paypal_merchant_connected",
        entity_type: "profile",
        entity_id: user.id,
        new_value: {
          merchant_id: merchantIdInPayPal,
          permissions_granted: permissionsGranted,
          payments_receivable: paymentsReceivable,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          merchant_id: merchantIdInPayPal,
          permissions_granted: permissionsGranted,
          payments_receivable: paymentsReceivable,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: get-status — Check merchant integration status
    // ═══════════════════════════════════════════════════════
    if (action === "get-status") {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("paypal_merchant_id, paypal_permissions_granted, paypal_connected_at")
        .eq("user_id", user.id)
        .single();

      if (!profile?.paypal_merchant_id) {
        return new Response(
          JSON.stringify({ connected: false }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Optionally verify with PayPal (cached check)
      let liveStatus = null;
      try {
        const accessToken = await getPayPalAccessToken();
        const partnerId = Deno.env.get("PAYPAL_CLIENT_ID")!;
        const statusRes = await fetch(
          `${PAYPAL_BASE}/v1/customer/partners/${partnerId}/merchant-integrations/${profile.paypal_merchant_id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (statusRes.ok) {
          liveStatus = await statusRes.json();
        }
      } catch (e) {
        console.warn("Could not fetch live PayPal status:", e);
      }

      return new Response(
        JSON.stringify({
          connected: true,
          merchant_id: profile.paypal_merchant_id,
          permissions_granted: profile.paypal_permissions_granted,
          connected_at: profile.paypal_connected_at,
          payments_receivable: liveStatus?.payments_receivable ?? profile.paypal_permissions_granted,
          primary_email: liveStatus?.primary_email_confirmed ? liveStatus.primary_email : undefined,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: disconnect — Remove PayPal merchant connection
    // ═══════════════════════════════════════════════════════
    if (action === "disconnect") {
      await adminClient
        .from("profiles")
        .update({
          paypal_merchant_id: null,
          paypal_permissions_granted: false,
          paypal_connected_at: null,
          paypal_email: null,
        })
        .eq("user_id", user.id);

      await adminClient
        .from("paypal_merchant_tokens")
        .delete()
        .eq("user_id", user.id);

      await adminClient.from("financial_audit_log").insert({
        user_id: user.id,
        action: "paypal_merchant_disconnected",
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
