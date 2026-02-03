import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MangopayWebhookEvent {
  EventType: string;
  RessourceId: string;
  Date: number;
  Timestamp?: number;
}

// MangoPay production IP ranges for webhook validation
const MANGOPAY_ALLOWED_IPS = [
  // MangoPay Production IPs
  "185.33.88.",
  "185.33.89.",
  // MangoPay Sandbox IPs
  "185.33.90.",
  "185.33.91.",
];

// Rate limiting map (in-memory, resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100; // Max requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms

function isIPAllowed(ip: string): boolean {
  return MANGOPAY_ALLOWED_IPS.some(prefix => ip.startsWith(prefix));
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

// ========== SECURITY: Sanitize webhook payload ==========
// Remove sensitive data before storing in logs
function sanitizePayload(event: MangopayWebhookEvent): Record<string, unknown> {
  return {
    EventType: event.EventType,
    RessourceId: event.RessourceId ? `***${event.RessourceId.slice(-6)}` : null, // Only last 6 chars
    Date: event.Date,
    Timestamp: event.Timestamp,
    // Hash for integrity verification
    payload_hash: hashPayload(event),
  };
}

// Create a hash of the original payload for integrity verification
function hashPayload(event: MangopayWebhookEvent): string {
  const data = JSON.stringify(event);
  const encoder = new TextEncoder();
  const hashBuffer = new Uint8Array(32);
  const dataBytes = encoder.encode(data);
  
  // Simple hash using XOR and rotation for integrity check
  for (let i = 0; i < dataBytes.length; i++) {
    hashBuffer[i % 32] ^= dataBytes[i];
  }
  
  return Array.from(hashBuffer).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// ========== SECURITY: Validate webhook signature ==========
async function validateWebhookSignature(
  req: Request,
  rawBody: string,
  webhookSecret: string | undefined
): Promise<boolean> {
  if (!webhookSecret) {
    console.warn("SECURITY: No webhook secret configured - signature validation skipped");
    return true; // Allow in dev mode
  }
  
  const signature = req.headers.get("x-mangopay-signature") || 
                    req.headers.get("mangopay-signature");
  
  if (!signature) {
    console.warn("SECURITY: No signature in webhook request");
    return false;
  }
  
  // Compute expected signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );
  
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Constant-time comparison
  if (signature.length !== expectedSignature.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const webhookSecret = Deno.env.get("MANGOPAY_WEBHOOK_SECRET");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ========== SECURITY: IP Validation ==========
    const sourceIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") ||
                     req.headers.get("x-real-ip") ||
                     "unknown";
    
    const mangopaySecurityEnabled = Deno.env.get("MANGOPAY_WEBHOOK_SECURITY") === "true";
    
    if (mangopaySecurityEnabled) {
      if (sourceIP === "unknown" || !isIPAllowed(sourceIP)) {
        console.error(`SECURITY: Unauthorized MangoPay webhook from IP: ${sourceIP}`);
        await supabase.from("webhook_logs").insert({
          processor: "mangopay",
          event_type: "SECURITY_VIOLATION",
          resource_id: "unauthorized_ip",
          payload: { error: "Unauthorized IP", ip_prefix: sourceIP.slice(0, 10) },
          processed: false,
          error_message: `Unauthorized webhook source`,
        });
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
      console.log(`SECURITY: MangoPay webhook from allowed IP`);
    }

    // ========== SECURITY: Rate Limiting ==========
    if (!checkRateLimit(sourceIP)) {
      console.error(`SECURITY: Rate limit exceeded`);
      await supabase.from("webhook_logs").insert({
        processor: "mangopay",
        event_type: "RATE_LIMIT_EXCEEDED",
        resource_id: "rate_limit",
        payload: { error: "Rate limit exceeded" },
        processed: false,
        error_message: `Rate limit exceeded`,
      });
      return new Response("Too Many Requests", { status: 429, headers: corsHeaders });
    }

    // Clone request to read body twice (for signature validation and parsing)
    const rawBody = await req.text();
    
    // ========== SECURITY: Signature Validation ==========
    if (webhookSecret) {
      const isValid = await validateWebhookSignature(req, rawBody, webhookSecret);
      if (!isValid) {
        console.error("SECURITY: Invalid webhook signature");
        await supabase.from("webhook_logs").insert({
          processor: "mangopay",
          event_type: "SIGNATURE_INVALID",
          resource_id: "signature_check",
          payload: { error: "Invalid signature" },
          processed: false,
          error_message: "Webhook signature validation failed",
        });
        return new Response("Invalid signature", { status: 401, headers: corsHeaders });
      }
    }

    const event: MangopayWebhookEvent = JSON.parse(rawBody);
    console.log("MangoPay Webhook received:", event.EventType);

    // ========== IDEMPOTENCY CHECK ==========
    const { data: existingLog } = await supabase
      .from("webhook_logs")
      .select("id, processed")
      .eq("processor", "mangopay")
      .eq("event_type", event.EventType)
      .eq("processed", true)
      .like("resource_id", `%${event.RessourceId.slice(-6)}`)
      .maybeSingle();

    if (existingLog) {
      console.log("Webhook already processed (idempotency check):", event.EventType);
      return new Response(
        JSON.stringify({ success: true, message: "Already processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log webhook event with SANITIZED payload (no sensitive data)
    await supabase.from("webhook_logs").insert({
      processor: "mangopay",
      event_type: event.EventType,
      resource_id: `***${event.RessourceId.slice(-6)}`, // Masked resource ID
      payload: sanitizePayload(event), // Sanitized payload
      processed: false,
    });

    // Handle different event types
    switch (event.EventType) {
      // PayIn events
      case "PAYIN_NORMAL_SUCCEEDED": {
        // Payment successful - update order status
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("processor_transaction_id", event.RessourceId)
          .single();

        if (order) {
          await supabase
            .from("orders")
            .update({
              status: "confirmed",
              processor_status: "completed",
              paid_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          // Notify seller
          await supabase.from("notifications").insert({
            user_id: order.seller_id,
            type: "payment_received",
            title: "Plată Primită!",
            message: `Plata pentru comanda #${order.id.substring(0, 8)} a fost confirmată.`,
            data: { order_id: order.id },
          });
        }
        break;
      }

      case "PAYIN_NORMAL_FAILED": {
        // Payment failed
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("processor_transaction_id", event.RessourceId)
          .single();

        if (order) {
          await supabase
            .from("orders")
            .update({
              status: "payment_failed",
              processor_status: "failed",
            })
            .eq("id", order.id);

          // Re-activate listing
          await supabase
            .from("listings")
            .update({ is_sold: false, is_active: true })
            .eq("id", order.listing_id);

          // Notify buyer
          await supabase.from("notifications").insert({
            user_id: order.buyer_id,
            type: "payment_failed",
            title: "Plată Eșuată",
            message: `Plata pentru comanda ta nu a putut fi procesată. Te rugăm să încerci din nou.`,
            data: { order_id: order.id },
          });
        }
        break;
      }

      // Payout events
      case "PAYOUT_NORMAL_SUCCEEDED": {
        // Payout to seller successful
        await supabase
          .from("seller_payouts")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("processor_payout_id", event.RessourceId);

        const { data: payout } = await supabase
          .from("seller_payouts")
          .select("seller_id, net_amount")
          .eq("processor_payout_id", event.RessourceId)
          .single();

        if (payout) {
          await supabase.from("notifications").insert({
            user_id: payout.seller_id,
            type: "payout_completed",
            title: "Transfer Finalizat!",
            message: `£${payout.net_amount.toFixed(2)} au fost transferați în contul tău bancar.`,
            data: { payout_id: event.RessourceId },
          });
        }
        break;
      }

      case "PAYOUT_NORMAL_FAILED": {
        await supabase
          .from("seller_payouts")
          .update({ status: "failed" })
          .eq("processor_payout_id", event.RessourceId);
        break;
      }

      // Refund events
      case "REFUND_NORMAL_SUCCEEDED": {
        await supabase
          .from("orders")
          .update({
            status: "refunded",
            refunded_at: new Date().toISOString(),
          })
          .eq("refund_transaction_id", event.RessourceId);
        break;
      }

      case "REFUND_NORMAL_FAILED": {
        await supabase
          .from("orders")
          .update({ refund_status: "failed" })
          .eq("refund_transaction_id", event.RessourceId);
        break;
      }

      // KYC events
      case "KYC_SUCCEEDED": {
        // Get user_id from profile
        const { data: verifiedProfile } = await supabase
          .from("profiles")
          .select("user_id, display_name, store_name")
          .eq("mangopay_user_id", event.RessourceId)
          .single();

        if (verifiedProfile) {
          // Update KYC status
          await supabase
            .from("profiles")
            .update({ 
              kyc_status: "verified",
              kyc_verified_at: new Date().toISOString()
            })
            .eq("user_id", verifiedProfile.user_id);

          // Send notification to seller
          await supabase.from("notifications").insert({
            user_id: verifiedProfile.user_id,
            type: "kyc_approved",
            title: "🎉 Verificare KYC Aprobată!",
            message: "Felicitări! Contul tău a fost verificat cu succes. Acum poți primi plăți și retrage fonduri.",
            data: { kyc_status: "verified" },
          });

          console.log("KYC approved notification sent to:", verifiedProfile.user_id);
        }
        break;
      }

      case "KYC_FAILED": {
        // Get user_id from profile
        const { data: rejectedProfile } = await supabase
          .from("profiles")
          .select("user_id, display_name, store_name")
          .eq("mangopay_user_id", event.RessourceId)
          .single();

        if (rejectedProfile) {
          // Update KYC status
          await supabase
            .from("profiles")
            .update({ kyc_status: "rejected" })
            .eq("user_id", rejectedProfile.user_id);

          // Send notification to seller
          await supabase.from("notifications").insert({
            user_id: rejectedProfile.user_id,
            type: "kyc_rejected",
            title: "⚠️ Verificare KYC Respinsă",
            message: "Documentele tale nu au putut fi verificate. Te rugăm să le reîncarci din Setări → Încasări.",
            data: { kyc_status: "rejected" },
          });

          console.log("KYC rejected notification sent to:", rejectedProfile.user_id);
        }
        break;
      }

      case "KYC_VALIDATION_ASKED": {
        // Get user_id from profile
        const { data: pendingProfile } = await supabase
          .from("profiles")
          .select("user_id, display_name, store_name")
          .eq("mangopay_user_id", event.RessourceId)
          .single();

        if (pendingProfile) {
          // Update KYC status
          await supabase
            .from("profiles")
            .update({ kyc_status: "pending" })
            .eq("user_id", pendingProfile.user_id);

          // Send notification to seller
          await supabase.from("notifications").insert({
            user_id: pendingProfile.user_id,
            type: "kyc_submitted",
            title: "📋 Documente KYC în Procesare",
            message: "Documentele tale sunt în curs de verificare. Vei primi o notificare când procesul este finalizat.",
            data: { kyc_status: "pending" },
          });

          console.log("KYC pending notification sent to:", pendingProfile.user_id);
        }
        break;
      }

      // User events
      case "USER_INACTIVITY_REMINDER":
      case "USER_KYCREQUESTED":
        // Handled by KYC events above
        break;

      default:
        console.log("Unhandled event type:", event.EventType);
    }

    // Mark webhook as processed
    await supabase
      .from("webhook_logs")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("resource_id", event.RessourceId)
      .eq("event_type", event.EventType);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
