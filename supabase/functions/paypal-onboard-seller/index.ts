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
    // ACTION: connect — Generate PayPal OAuth Login URL
    // Uses "Log in with PayPal" (OpenID Connect) flow
    // ═══════════════════════════════════════════════════════
    if (action === "connect") {
      const { return_url } = body;
      const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
      
      // Build the PayPal OAuth consent URL
      // The seller will log in to PayPal and authorize our app
      const redirectUri = encodeURIComponent(
        return_url || "https://www.marketplaceromania.com/seller-mode"
      );
      
      // State parameter contains user ID for security verification
      const state = btoa(JSON.stringify({ userId: user.id, ts: Date.now() }));
      
      const paypalLoginUrl = `https://www.paypal.com/signin/authorize?` +
        `client_id=${clientId}` +
        `&response_type=code` +
        `&scope=openid profile email` +
        `&redirect_uri=${redirectUri}` +
        `&state=${state}`;

      return new Response(
        JSON.stringify({ success: true, action_url: paypalLoginUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: complete-onboarding — Exchange auth code for user info
    // Called after PayPal redirects back with authorization code
    // ═══════════════════════════════════════════════════════
    if (action === "complete-onboarding") {
      const { code, merchantIdInPayPal } = body;

      // If we have a direct merchantIdInPayPal (from URL param), use it
      if (merchantIdInPayPal) {
        const { error: profileError } = await adminClient
          .from("profiles")
          .update({
            paypal_merchant_id: merchantIdInPayPal,
            paypal_permissions_granted: true,
            paypal_connected_at: new Date().toISOString(),
            paypal_email: merchantIdInPayPal,
          })
          .eq("user_id", user.id);

        if (profileError) throw profileError;

        await adminClient.from("paypal_merchant_tokens").upsert({
          user_id: user.id,
          merchant_id: merchantIdInPayPal,
          access_token: "direct_connect",
          scopes: ["PAYMENT", "REFUND"],
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

        await adminClient.from("financial_audit_log").insert({
          user_id: user.id,
          action: "paypal_merchant_connected",
          entity_type: "profile",
          entity_id: user.id,
          new_value: { merchant_id: merchantIdInPayPal, method: "direct" },
        });

        return new Response(
          JSON.stringify({
            success: true,
            merchant_id: merchantIdInPayPal,
            permissions_granted: true,
            payments_receivable: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Exchange authorization code for access token
      if (!code) {
        throw new Error("Missing authorization code or merchantIdInPayPal");
      }

      const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
      const secret = Deno.env.get("PAYPAL_SECRET_KEY")!;

      const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=authorization_code&code=${code}`,
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Token exchange failed:", errText);
        throw new Error(`PayPal token exchange failed: ${tokenRes.status}`);
      }

      const tokenData = await tokenRes.json();
      const userAccessToken = tokenData.access_token;

      // Get seller's PayPal user info
      const userInfoRes = await fetch(`${PAYPAL_BASE}/v1/identity/openidconnect/userinfo?schema=openid`, {
        headers: { Authorization: `Bearer ${userAccessToken}` },
      });

      if (!userInfoRes.ok) {
        const errText = await userInfoRes.text();
        console.error("UserInfo failed:", errText);
        throw new Error(`PayPal userinfo failed: ${userInfoRes.status}`);
      }

      const userInfo = await userInfoRes.json();
      const paypalEmail = userInfo.email || userInfo.emails?.[0]?.value;
      const payerId = userInfo.payer_id || userInfo.user_id;

      if (!payerId && !paypalEmail) {
        throw new Error("Could not retrieve PayPal account details");
      }

      const merchantId = payerId || paypalEmail;

      // Save merchant connection
      const { error: profileError } = await adminClient
        .from("profiles")
        .update({
          paypal_merchant_id: merchantId,
          paypal_permissions_granted: true,
          paypal_connected_at: new Date().toISOString(),
          paypal_email: paypalEmail,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Store tokens securely
      await adminClient.from("paypal_merchant_tokens").upsert({
        user_id: user.id,
        merchant_id: merchantId,
        access_token: userAccessToken,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        scopes: tokenData.scope?.split(" ") || ["openid", "profile", "email"],
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // Audit log
      await adminClient.from("financial_audit_log").insert({
        user_id: user.id,
        action: "paypal_merchant_connected",
        entity_type: "profile",
        entity_id: user.id,
        new_value: {
          merchant_id: merchantId,
          email: paypalEmail,
          method: "oauth",
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          merchant_id: merchantId,
          email: paypalEmail,
          permissions_granted: true,
          payments_receivable: true,
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
        .select("paypal_merchant_id, paypal_permissions_granted, paypal_connected_at, paypal_email")
        .eq("user_id", user.id)
        .single();

      if (!profile?.paypal_merchant_id) {
        return new Response(
          JSON.stringify({ connected: false }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          connected: true,
          merchant_id: profile.paypal_merchant_id,
          permissions_granted: profile.paypal_permissions_granted,
          connected_at: profile.paypal_connected_at,
          payments_receivable: profile.paypal_permissions_granted,
          primary_email: profile.paypal_email,
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
