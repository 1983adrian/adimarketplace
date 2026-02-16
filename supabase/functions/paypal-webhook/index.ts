import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource || {};

    console.log("PayPal Webhook received:", eventType);

    // ═══════════════════════════════════════════════════════
    // MERCHANT.ONBOARDING.COMPLETED
    // PayPal notifies when a seller completes onboarding/KYC
    // ═══════════════════════════════════════════════════════
    if (eventType === "MERCHANT.ONBOARDING.COMPLETED") {
      const merchantId = resource.merchant_id;
      const trackingId = resource.tracking_id;
      const partnerMerchantId = resource.partner_merchant_id;

      if (!merchantId) {
        console.warn("Missing merchant_id in onboarding webhook");
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find the user with this merchant_id
      const { data: profile } = await adminClient
        .from("profiles")
        .select("user_id, paypal_merchant_id")
        .eq("paypal_merchant_id", merchantId)
        .single();

      if (profile) {
        // Update merchant status
        await adminClient
          .from("profiles")
          .update({
            paypal_permissions_granted: true,
            is_seller: true,
          })
          .eq("user_id", profile.user_id);

        // Notify seller
        await adminClient.from("notifications").insert({
          user_id: profile.user_id,
          type: "paypal_verified",
          title: "✅ Verificare PayPal completă!",
          message:
            "Contul tău PayPal a fost verificat cu succes de PayPal. Poți primi plăți de la cumpărători acum!",
          data: { merchant_id: merchantId },
        });

        // Audit log
        await adminClient.from("financial_audit_log").insert({
          user_id: profile.user_id,
          action: "paypal_onboarding_completed",
          entity_type: "webhook",
          entity_id: merchantId,
          new_value: {
            event: eventType,
            merchant_id: merchantId,
            tracking_id: trackingId,
          },
        });
      }
    }

    // ═══════════════════════════════════════════════════════
    // MERCHANT.PARTNER-CONSENT.REVOKED
    // PayPal notifies when a seller revokes permissions
    // ═══════════════════════════════════════════════════════
    if (eventType === "MERCHANT.PARTNER-CONSENT.REVOKED") {
      const merchantId = resource.merchant_id;

      if (merchantId) {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("user_id")
          .eq("paypal_merchant_id", merchantId)
          .single();

        if (profile) {
          await adminClient
            .from("profiles")
            .update({
              paypal_permissions_granted: false,
            })
            .eq("user_id", profile.user_id);

          await adminClient.from("notifications").insert({
            user_id: profile.user_id,
            type: "paypal_consent_revoked",
            title: "⚠️ Permisiuni PayPal revocate",
            message:
              "Ai revocat permisiunile pentru platforma noastră în contul PayPal. Nu poți primi plăți până nu reconectezi contul.",
            data: { merchant_id: merchantId },
          });

          await adminClient.from("financial_audit_log").insert({
            user_id: profile.user_id,
            action: "paypal_consent_revoked",
            entity_type: "webhook",
            entity_id: merchantId,
            new_value: { event: eventType, merchant_id: merchantId },
          });
        }
      }
    }

    // ═══════════════════════════════════════════════════════
    // CUSTOMER.MANAGED-ACCOUNT.ACCOUNT-STATUS-CHANGED
    // PayPal notifies when KYC status changes (needs docs etc.)
    // ═══════════════════════════════════════════════════════
    if (
      eventType === "CUSTOMER.MANAGED-ACCOUNT.ACCOUNT-STATUS-CHANGED" ||
      eventType === "CUSTOMER.MANAGED-ACCOUNT.LIMITATION-ADDED"
    ) {
      const merchantId = resource.merchant_id || resource.id;

      if (merchantId) {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("user_id")
          .eq("paypal_merchant_id", merchantId)
          .single();

        if (profile) {
          await adminClient.from("notifications").insert({
            user_id: profile.user_id,
            type: "paypal_kyc_update",
            title: "📋 PayPal solicită acțiunea ta",
            message:
              "PayPal solicită documente sau informații suplimentare pentru contul tău de vânzător. Verifică email-ul și contul PayPal.",
            data: {
              merchant_id: merchantId,
              event: eventType,
            },
          });

          await adminClient.from("financial_audit_log").insert({
            user_id: profile.user_id,
            action: "paypal_kyc_status_change",
            entity_type: "webhook",
            entity_id: merchantId,
            new_value: {
              event: eventType,
              merchant_id: merchantId,
              resource: JSON.stringify(resource).substring(0, 500),
            },
          });
        }
      }
    }

    // Always return 200 to PayPal
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("PayPal webhook error:", error);
    // Still return 200 to avoid PayPal retries on our processing errors
    return new Response(JSON.stringify({ received: true, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
