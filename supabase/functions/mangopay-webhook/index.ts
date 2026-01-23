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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event: MangopayWebhookEvent = await req.json();
    console.log("MangoPay Webhook received:", event.EventType, event.RessourceId);

    // Log webhook event
    await supabase.from("webhook_logs").insert({
      processor: "mangopay",
      event_type: event.EventType,
      resource_id: event.RessourceId,
      payload: event,
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
