import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdyenNotificationItem {
  NotificationRequestItem: {
    eventCode: string;
    pspReference: string;
    merchantReference: string;
    amount: { value: number; currency: string };
    success: string;
    reason?: string;
    additionalData?: Record<string, string>;
  };
}

interface AdyenWebhookPayload {
  live: string;
  notificationItems: AdyenNotificationItem[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: AdyenWebhookPayload = await req.json();
    console.log("Adyen Webhook received:", payload.notificationItems?.length, "items");

    // Process each notification item
    for (const item of payload.notificationItems || []) {
      const notification = item.NotificationRequestItem;
      const { eventCode, pspReference, merchantReference, success, reason } = notification;

      console.log("Processing Adyen event:", eventCode, pspReference, success);

      // Log webhook event
      await supabase.from("webhook_logs").insert({
        processor: "adyen",
        event_type: eventCode,
        resource_id: pspReference,
        payload: notification,
        processed: false,
      });

      const isSuccess = success === "true";

      switch (eventCode) {
        case "AUTHORISATION": {
          if (isSuccess) {
            // Payment authorized - update order
            const { data: order } = await supabase
              .from("orders")
              .select("*")
              .eq("processor_transaction_id", pspReference)
              .single();

            if (order) {
              await supabase
                .from("orders")
                .update({
                  status: "confirmed",
                  processor_status: "authorized",
                  paid_at: new Date().toISOString(),
                })
                .eq("id", order.id);

              await supabase.from("notifications").insert({
                user_id: order.seller_id,
                type: "payment_received",
                title: "Plată Primită!",
                message: `Plata pentru comanda #${order.id.substring(0, 8)} a fost autorizată.`,
                data: { order_id: order.id },
              });
            }
          } else {
            // Authorization failed
            const { data: order } = await supabase
              .from("orders")
              .select("*")
              .eq("processor_transaction_id", pspReference)
              .single();

            if (order) {
              await supabase
                .from("orders")
                .update({
                  status: "payment_failed",
                  processor_status: "authorization_failed",
                  processor_error: reason,
                })
                .eq("id", order.id);

              await supabase
                .from("listings")
                .update({ is_sold: false, is_active: true })
                .eq("id", order.listing_id);
            }
          }
          break;
        }

        case "CAPTURE": {
          if (isSuccess) {
            await supabase
              .from("orders")
              .update({ processor_status: "captured" })
              .eq("processor_transaction_id", pspReference);
          }
          break;
        }

        case "REFUND": {
          if (isSuccess) {
            await supabase
              .from("orders")
              .update({
                status: "refunded",
                refunded_at: new Date().toISOString(),
                refund_status: "completed",
              })
              .eq("processor_transaction_id", pspReference);

            const { data: order } = await supabase
              .from("orders")
              .select("buyer_id, amount")
              .eq("processor_transaction_id", pspReference)
              .single();

            if (order) {
              await supabase.from("notifications").insert({
                user_id: order.buyer_id,
                type: "refund_processed",
                title: "Rambursare Procesată",
                message: `£${(notification.amount.value / 100).toFixed(2)} au fost rambursați.`,
                data: { psp_reference: pspReference },
              });
            }
          } else {
            await supabase
              .from("orders")
              .update({ refund_status: "failed" })
              .eq("processor_transaction_id", pspReference);
          }
          break;
        }

        case "CANCEL_OR_REFUND": {
          if (isSuccess) {
            await supabase
              .from("orders")
              .update({
                status: "cancelled",
                cancelled_at: new Date().toISOString(),
              })
              .eq("processor_transaction_id", pspReference);
          }
          break;
        }

        case "PAYOUT_EXPIRE":
        case "PAYOUT_DECLINE": {
          await supabase
            .from("seller_payouts")
            .update({ status: "failed" })
            .eq("processor_payout_id", pspReference);
          break;
        }

        case "PAYOUT_THIRDPARTY": {
          if (isSuccess) {
            await supabase
              .from("seller_payouts")
              .update({
                status: "completed",
                completed_at: new Date().toISOString(),
              })
              .eq("processor_payout_id", pspReference);
          }
          break;
        }

        case "CHARGEBACK": {
          // Handle dispute/chargeback
          const { data: order } = await supabase
            .from("orders")
            .select("*")
            .eq("processor_transaction_id", pspReference)
            .single();

          if (order) {
            await supabase
              .from("orders")
              .update({
                status: "disputed",
                dispute_reason: reason,
                dispute_opened_at: new Date().toISOString(),
              })
              .eq("id", order.id);

            // Notify admin
            const { data: admins } = await supabase
              .from("user_roles")
              .select("user_id")
              .eq("role", "admin");

            for (const admin of admins || []) {
              await supabase.from("notifications").insert({
                user_id: admin.user_id,
                type: "chargeback",
                title: "⚠️ Chargeback Primit",
                message: `Comandă #${order.id.substring(0, 8)}: ${reason || "Dispute deschis"}`,
                data: { order_id: order.id },
              });
            }
          }
          break;
        }

        default:
          console.log("Unhandled Adyen event:", eventCode);
      }

      // Mark as processed
      await supabase
        .from("webhook_logs")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("resource_id", pspReference)
        .eq("event_type", eventCode);
    }

    // Adyen expects "[accepted]" response
    return new Response("[accepted]", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Adyen webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
