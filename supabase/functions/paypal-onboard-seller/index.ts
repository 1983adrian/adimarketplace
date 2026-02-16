import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Determine PayPal base URL from admin settings
function getPayPalBase(environment: string): string {
  return environment === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

// Get PayPal config from payment_processor_settings table
async function getPayPalConfig(adminClient: any) {
  const { data, error } = await adminClient
    .from("payment_processor_settings")
    .select("api_key_encrypted, api_secret_encrypted, partner_id, bn_code, environment, is_active")
    .eq("processor_name", "paypal")
    .single();

  if (error || !data) {
    throw new Error("PayPal nu este configurat. Administratorul trebuie să salveze cheile API în panoul Admin.");
  }
  if (!data.is_active) {
    throw new Error("PayPal este dezactivat de administrator.");
  }
  if (!data.api_key_encrypted || !data.api_secret_encrypted) {
    throw new Error("Cheile API PayPal (Client ID / Secret) nu sunt configurate.");
  }
  if (!data.partner_id) {
    throw new Error("Partner ID (Merchant ID platformă) nu este configurat. Obligatoriu pentru marketplace.");
  }

  return {
    clientId: data.api_key_encrypted,
    secret: data.api_secret_encrypted,
    partnerId: data.partner_id,
    bnCode: data.bn_code || "",
    environment: data.environment || "sandbox",
    baseUrl: getPayPalBase(data.environment || "sandbox"),
  };
}

async function getAccessToken(config: any): Promise<string> {
  const res = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${config.clientId}:${config.secret}`)}`,
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

    // Get PayPal config from admin settings
    const config = await getPayPalConfig(adminClient);
    const accessToken = await getAccessToken(config);

    // ═══════════════════════════════════════════════════════
    // ACTION: connect — Generate Partner Referral URL
    // Uses PayPal Partner Referrals API v2 (compliant marketplace onboarding)
    // ═══════════════════════════════════════════════════════
    if (action === "connect") {
      const { return_url, seller_email, seller_name } = body;

      const trackingId = `seller_${user.id}_${Date.now()}`;
      const returnUrl = return_url || "https://www.marketplaceromania.com/profile-settings";

      // Build Partner Referrals request per PayPal Commerce Platform requirements
      const referralPayload: any = {
        tracking_id: trackingId,
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
          return_url: `${returnUrl}?trackingId=${trackingId}`,
          return_url_description: "Marketplace Romania — Finalizare înregistrare vânzător",
          show_add_credit_card: true,
        },
      };

      // Pre-fill seller info if available
      if (seller_email || seller_name) {
        referralPayload.individual_owners = [
          {
            email: seller_email || undefined,
            name: seller_name
              ? { given_name: seller_name.split(" ")[0], surname: seller_name.split(" ").slice(1).join(" ") || "." }
              : undefined,
          },
        ];
      }

      const headers: any = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      if (config.bnCode) {
        headers["PayPal-Partner-Attribution-Id"] = config.bnCode;
      }

      const referralRes = await fetch(`${config.baseUrl}/v2/customer/partner-referrals`, {
        method: "POST",
        headers,
        body: JSON.stringify(referralPayload),
      });

      if (!referralRes.ok) {
        const errText = await referralRes.text();
        console.error("Partner Referrals failed:", errText);
        throw new Error(`PayPal Partner Referrals error (${referralRes.status}): ${errText}`);
      }

      const referralData = await referralRes.json();

      // Find the action_url from HATEOAS links
      const actionUrl = referralData.links?.find(
        (l: any) => l.rel === "action_url"
      )?.href;

      if (!actionUrl) {
        throw new Error("PayPal nu a returnat un URL de onboarding. Verifică configurarea Partner.");
      }

      // Save tracking_id to match later
      await adminClient.from("paypal_merchant_tokens").upsert(
        {
          user_id: user.id,
          merchant_id: trackingId,
          access_token: "pending_onboarding",
          scopes: ["PAYMENT", "REFUND"],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      return new Response(
        JSON.stringify({
          success: true,
          action_url: actionUrl,
          tracking_id: trackingId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: complete-onboarding — After PayPal redirects back
    // Captures merchantIdInPayPal from return URL
    // ═══════════════════════════════════════════════════════
    if (action === "complete-onboarding") {
      const { merchantIdInPayPal, trackingId } = body;

      if (!merchantIdInPayPal) {
        throw new Error("Merchant ID de la PayPal nu a fost primit. Reîncearcă procesul de conectare.");
      }

      // Verify merchant integration status with PayPal
      const statusHeaders: any = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      if (config.bnCode) {
        statusHeaders["PayPal-Partner-Attribution-Id"] = config.bnCode;
      }

      const statusRes = await fetch(
        `${config.baseUrl}/v1/customer/partners/${config.partnerId}/merchant-integrations/${merchantIdInPayPal}`,
        { headers: statusHeaders }
      );

      let merchantStatus: any = {};
      if (statusRes.ok) {
        merchantStatus = await statusRes.json();
      } else {
        console.warn("Could not fetch merchant status:", await statusRes.text());
      }

      const paymentsReceivable = merchantStatus.payments_receivable ?? true;
      const primaryEmail = merchantStatus.primary_email_confirmed
        ? merchantStatus.primary_email
        : null;
      const kycCompleted = merchantStatus.oauth_integrations?.[0]?.oauth_third_party?.[0]?.scopes?.length > 0;

      // Save merchant connection
      const { error: profileError } = await adminClient
        .from("profiles")
        .update({
          paypal_merchant_id: merchantIdInPayPal,
          paypal_permissions_granted: paymentsReceivable,
          paypal_connected_at: new Date().toISOString(),
          paypal_email: primaryEmail || merchantIdInPayPal,
          is_seller: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Update stored token record
      await adminClient.from("paypal_merchant_tokens").upsert(
        {
          user_id: user.id,
          merchant_id: merchantIdInPayPal,
          access_token: "partner_referral_connected",
          scopes: ["PAYMENT", "REFUND"],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      // Audit log
      await adminClient.from("financial_audit_log").insert({
        user_id: user.id,
        action: "paypal_merchant_connected",
        entity_type: "profile",
        entity_id: user.id,
        new_value: {
          merchant_id: merchantIdInPayPal,
          tracking_id: trackingId,
          payments_receivable: paymentsReceivable,
          kyc_completed: kycCompleted,
          method: "partner_referrals_v2",
        },
      });

      // Send notification to seller about KYC requirements
      await adminClient.from("notifications").insert({
        user_id: user.id,
        type: "paypal_connected",
        title: "✅ PayPal conectat cu succes!",
        message: paymentsReceivable
          ? "Contul tău PayPal este verificat și poți primi plăți. PayPal poate solicita documente suplimentare — verifică periodic notificările din contul PayPal."
          : "Contul tău PayPal a fost conectat, dar PayPal necesită verificare suplimentară (KYC). Verifică email-ul și contul PayPal pentru instrucțiuni.",
        data: {
          merchant_id: merchantIdInPayPal,
          payments_receivable: paymentsReceivable,
          kyc_completed: kycCompleted,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          merchant_id: merchantIdInPayPal,
          email: primaryEmail,
          permissions_granted: paymentsReceivable,
          payments_receivable: paymentsReceivable,
          kyc_completed: kycCompleted,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: get-status — Check merchant integration status
    // Uses Partner API to get real-time status from PayPal
    // ═══════════════════════════════════════════════════════
    if (action === "get-status") {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("paypal_merchant_id, paypal_permissions_granted, paypal_connected_at, paypal_email")
        .eq("user_id", user.id)
        .single();

      if (!profile?.paypal_merchant_id) {
        return new Response(
          JSON.stringify({ connected: false }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Query PayPal for real-time merchant status
      let merchantStatus: any = {};
      let kycRequired = false;
      try {
        const statusHeaders: any = {
          Authorization: `Bearer ${accessToken}`,
        };
        if (config.bnCode) {
          statusHeaders["PayPal-Partner-Attribution-Id"] = config.bnCode;
        }

        const statusRes = await fetch(
          `${config.baseUrl}/v1/customer/partners/${config.partnerId}/merchant-integrations/${profile.paypal_merchant_id}`,
          { headers: statusHeaders }
        );

        if (statusRes.ok) {
          merchantStatus = await statusRes.json();
          kycRequired = merchantStatus.payments_receivable === false;

          // Update profile if status changed
          if (merchantStatus.payments_receivable !== profile.paypal_permissions_granted) {
            await adminClient
              .from("profiles")
              .update({
                paypal_permissions_granted: merchantStatus.payments_receivable,
              })
              .eq("user_id", user.id);

            // Notify seller if PayPal requires KYC
            if (kycRequired) {
              await adminClient.from("notifications").insert({
                user_id: user.id,
                type: "paypal_kyc_required",
                title: "⚠️ PayPal necesită verificare",
                message:
                  "PayPal solicită documente suplimentare pentru a activa plățile. Intră în contul PayPal și urmează instrucțiunile de verificare (KYC).",
                data: { merchant_id: profile.paypal_merchant_id },
              });
            }
          }
        }
      } catch (e) {
        console.warn("Could not fetch merchant status from PayPal:", e);
      }

      return new Response(
        JSON.stringify({
          connected: true,
          merchant_id: profile.paypal_merchant_id,
          permissions_granted: merchantStatus.payments_receivable ?? profile.paypal_permissions_granted,
          connected_at: profile.paypal_connected_at,
          payments_receivable: merchantStatus.payments_receivable ?? profile.paypal_permissions_granted,
          primary_email: profile.paypal_email,
          kyc_required: kycRequired,
          products: merchantStatus.products || [],
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
