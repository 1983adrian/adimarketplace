import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-PAYOUT] ${step}${detailsStr}`);
};

// PayPal API helpers
async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_SECRET");
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await response.json();
  return data.access_token;
}

async function sendPayPalPayout(accessToken: string, payout: {
  recipientEmail: string;
  amount: number;
  currency: string;
  payoutId: string;
  note: string;
}): Promise<{ payoutBatchId: string }> {
  const response = await fetch("https://api-m.paypal.com/v1/payments/payouts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: `adimarket_${payout.payoutId}`,
        email_subject: "AdiMarket - Your payment has arrived!",
        email_message: "You have received a payment from AdiMarket for your sale.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: payout.amount.toFixed(2),
            currency: payout.currency,
          },
          receiver: payout.recipientEmail,
          note: payout.note,
          sender_item_id: payout.payoutId,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal payout failed: ${error}`);
  }

  const data = await response.json();
  return { payoutBatchId: data.batch_header.payout_batch_id };
}

async function checkPayPalPayoutStatus(accessToken: string, payoutBatchId: string): Promise<string> {
  const response = await fetch(`https://api-m.paypal.com/v1/payments/payouts/${payoutBatchId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to check payout status");
  }

  const data = await response.json();
  return data.batch_header.batch_status;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started - Auto Payout Processor");

    const { action, payout_id } = await req.json();

    // Action: process_pending - Process all pending payouts
    if (action === "process_pending") {
      logStep("Processing pending payouts");

      // Get all pending payouts
      const { data: pendingPayouts, error: fetchError } = await supabaseClient
        .from("payouts")
        .select("*, orders!inner(id, listings(title))")
        .eq("status", "pending")
        .is("paypal_payout_id", null);

      if (fetchError) {
        throw new Error(`Error fetching pending payouts: ${fetchError.message}`);
      }

      if (!pendingPayouts || pendingPayouts.length === 0) {
        return new Response(JSON.stringify({ message: "No pending payouts to process", processed: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      logStep("Found pending payouts", { count: pendingPayouts.length });

      let accessToken: string;
      try {
        accessToken = await getPayPalAccessToken();
      } catch (err) {
        return new Response(JSON.stringify({ error: "PayPal authentication failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      let processed = 0;
      let failed = 0;

      for (const payout of pendingPayouts) {
        try {
          // Get seller email
          const { data: sellerAuth } = await supabaseClient.auth.admin.getUserById(payout.seller_id);
          const sellerEmail = sellerAuth?.user?.email;

          if (!sellerEmail) {
            logStep("No seller email for payout", { payoutId: payout.id });
            failed++;
            continue;
          }

          const result = await sendPayPalPayout(accessToken, {
            recipientEmail: sellerEmail,
            amount: payout.net_amount,
            currency: "GBP",
            payoutId: payout.id,
            note: `Payment for order - ${payout.orders?.listings?.title || 'Item sale'}`,
          });

          // Update payout record
          await supabaseClient
            .from("payouts")
            .update({
              paypal_payout_id: result.payoutBatchId,
              status: "processing",
              updated_at: new Date().toISOString(),
            })
            .eq("id", payout.id);

          // Update order payout status
          await supabaseClient
            .from("orders")
            .update({ payout_status: "processing" })
            .eq("id", payout.order_id);

          // Send notification to seller
          await supabaseClient.from("notifications").insert({
            user_id: payout.seller_id,
            type: "payout",
            title: "Payment Processing",
            message: `Your payment of £${payout.net_amount.toFixed(2)} has been sent to your PayPal.`,
            data: { payoutId: payout.id, amount: payout.net_amount },
          });

          processed++;
          logStep("Payout processed", { payoutId: payout.id, paypalId: result.payoutBatchId });
        } catch (err) {
          logStep("Payout failed", { payoutId: payout.id, error: err instanceof Error ? err.message : String(err) });
          failed++;
        }
      }

      return new Response(JSON.stringify({
        message: "Payout processing complete",
        processed,
        failed,
        total: pendingPayouts.length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: check_status - Check and update payout statuses
    if (action === "check_status") {
      logStep("Checking payout statuses");

      const { data: processingPayouts, error: fetchError } = await supabaseClient
        .from("payouts")
        .select("*")
        .eq("status", "processing")
        .not("paypal_payout_id", "is", null);

      if (fetchError) {
        throw new Error(`Error fetching processing payouts: ${fetchError.message}`);
      }

      if (!processingPayouts || processingPayouts.length === 0) {
        return new Response(JSON.stringify({ message: "No processing payouts to check", updated: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let accessToken: string;
      try {
        accessToken = await getPayPalAccessToken();
      } catch (err) {
        return new Response(JSON.stringify({ error: "PayPal authentication failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      let updated = 0;

      for (const payout of processingPayouts) {
        try {
          const status = await checkPayPalPayoutStatus(accessToken, payout.paypal_payout_id!);

          let newStatus = payout.status;
          if (status === "SUCCESS") {
            newStatus = "completed";
          } else if (status === "DENIED" || status === "CANCELED") {
            newStatus = "failed";
          }

          if (newStatus !== payout.status) {
            await supabaseClient
              .from("payouts")
              .update({
                status: newStatus,
                processed_at: newStatus === "completed" ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", payout.id);

            await supabaseClient
              .from("orders")
              .update({
                payout_status: newStatus,
                payout_at: newStatus === "completed" ? new Date().toISOString() : null,
              })
              .eq("id", payout.order_id);

            // Notify seller
            await supabaseClient.from("notifications").insert({
              user_id: payout.seller_id,
              type: "payout",
              title: newStatus === "completed" ? "Payment Received!" : "Payment Issue",
              message: newStatus === "completed"
                ? `Your payment of £${payout.net_amount.toFixed(2)} has been deposited to your PayPal.`
                : `There was an issue with your payment. Please contact support.`,
              data: { payoutId: payout.id },
            });

            updated++;
            logStep("Payout status updated", { payoutId: payout.id, oldStatus: payout.status, newStatus });
          }
        } catch (err) {
          logStep("Status check failed", { payoutId: payout.id, error: err instanceof Error ? err.message : String(err) });
        }
      }

      return new Response(JSON.stringify({
        message: "Status check complete",
        updated,
        total: processingPayouts.length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: retry_payout - Retry a specific failed payout
    if (action === "retry_payout" && payout_id) {
      const { data: payout, error: fetchError } = await supabaseClient
        .from("payouts")
        .select("*, orders(id, listings(title))")
        .eq("id", payout_id)
        .single();

      if (fetchError || !payout) {
        throw new Error("Payout not found");
      }

      const { data: sellerAuth } = await supabaseClient.auth.admin.getUserById(payout.seller_id);
      const sellerEmail = sellerAuth?.user?.email;

      if (!sellerEmail) {
        throw new Error("Seller email not found");
      }

      const accessToken = await getPayPalAccessToken();
      const result = await sendPayPalPayout(accessToken, {
        recipientEmail: sellerEmail,
        amount: payout.net_amount,
        currency: "GBP",
        payoutId: `retry_${payout.id}`,
        note: `Payment for order - ${payout.orders?.listings?.title || 'Item sale'}`,
      });

      await supabaseClient
        .from("payouts")
        .update({
          paypal_payout_id: result.payoutBatchId,
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payout.id);

      return new Response(JSON.stringify({
        success: true,
        message: "Payout retry initiated",
        paypal_payout_id: result.payoutBatchId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
