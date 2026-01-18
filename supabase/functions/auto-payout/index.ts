import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-PAYOUT] ${step}${detailsStr}`);
};

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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { action, payout_id } = await req.json();

    // Action: process_pending - Process all pending payouts
    if (action === "process_pending") {
      logStep("Processing pending payouts");

      // Get all pending payouts
      const { data: pendingPayouts, error: fetchError } = await supabaseClient
        .from("payouts")
        .select("*, orders!inner(id, listings(title))")
        .eq("status", "pending")
        .is("stripe_transfer_id", null);

      if (fetchError) {
        throw new Error(`Error fetching pending payouts: ${fetchError.message}`);
      }

      if (!pendingPayouts || pendingPayouts.length === 0) {
        return new Response(JSON.stringify({ message: "No pending payouts to process", processed: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      logStep("Found pending payouts", { count: pendingPayouts.length });

      let processed = 0;
      let failed = 0;

      for (const payout of pendingPayouts) {
        try {
          // Get seller Stripe account ID from profile
          const { data: sellerProfile } = await supabaseClient
            .from('profiles')
            .select('stripe_account_id')
            .eq('user_id', payout.seller_id)
            .single();

          if (!sellerProfile?.stripe_account_id) {
            logStep("Seller has no Stripe account", { payoutId: payout.id });
            failed++;
            continue;
          }

          // Create Stripe transfer
          const transfer = await stripe.transfers.create({
            amount: Math.round(payout.net_amount * 100), // Amount in pence
            currency: "gbp",
            destination: sellerProfile.stripe_account_id,
            transfer_group: `ORDER_${payout.order_id}`,
            metadata: {
              order_id: payout.order_id,
              payout_id: payout.id,
              listing_title: payout.orders?.listings?.title || 'Item sale',
            },
          });

          // Update payout record
          await supabaseClient
            .from("payouts")
            .update({
              stripe_transfer_id: transfer.id,
              status: "completed",
              processed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", payout.id);

          // Update order payout status
          await supabaseClient
            .from("orders")
            .update({ 
              payout_status: "completed",
              payout_at: new Date().toISOString(),
            })
            .eq("id", payout.order_id);

          // Send notification to seller
          await supabaseClient.from("notifications").insert({
            user_id: payout.seller_id,
            type: "payout",
            title: "Plată Primită!",
            message: `Plata de £${payout.net_amount.toFixed(2)} a fost transferată în contul tău Stripe.`,
            data: { payoutId: payout.id, amount: payout.net_amount },
          });

          processed++;
          logStep("Payout processed", { payoutId: payout.id, transferId: transfer.id });
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

    // Action: check_status - Check and update payout statuses via Stripe
    if (action === "check_status") {
      logStep("Checking payout statuses");

      const { data: processingPayouts, error: fetchError } = await supabaseClient
        .from("payouts")
        .select("*")
        .in("status", ["processing", "pending"])
        .not("stripe_transfer_id", "is", null);

      if (fetchError) {
        throw new Error(`Error fetching processing payouts: ${fetchError.message}`);
      }

      if (!processingPayouts || processingPayouts.length === 0) {
        return new Response(JSON.stringify({ message: "No processing payouts to check", updated: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let updated = 0;

      for (const payout of processingPayouts) {
        try {
          // Retrieve transfer from Stripe
          const transfer = await stripe.transfers.retrieve(payout.stripe_transfer_id!);

          let newStatus = payout.status;
          if (!transfer.reversed) {
            newStatus = "completed";
          } else {
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
              title: newStatus === "completed" ? "Plată Finalizată!" : "Problemă cu Plata",
              message: newStatus === "completed"
                ? `Plata de £${payout.net_amount.toFixed(2)} a fost finalizată.`
                : `A apărut o problemă cu plata ta. Contactează suportul.`,
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

      // Get seller Stripe account ID from profile
      const { data: sellerProfile } = await supabaseClient
        .from('profiles')
        .select('stripe_account_id')
        .eq('user_id', payout.seller_id)
        .single();

      if (!sellerProfile?.stripe_account_id) {
        throw new Error("Vânzătorul nu are un cont Stripe conectat. Te rog conectează-ți contul Stripe în Setări.");
      }

      // Create Stripe transfer
      const transfer = await stripe.transfers.create({
        amount: Math.round(payout.net_amount * 100),
        currency: "gbp",
        destination: sellerProfile.stripe_account_id,
        transfer_group: `ORDER_${payout.order_id}`,
        metadata: {
          order_id: payout.order_id,
          payout_id: `retry_${payout.id}`,
          listing_title: payout.orders?.listings?.title || 'Item sale',
        },
      });

      await supabaseClient
        .from("payouts")
        .update({
          stripe_transfer_id: transfer.id,
          status: "completed",
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payout.id);

      await supabaseClient
        .from("orders")
        .update({
          payout_status: "completed",
          payout_at: new Date().toISOString(),
        })
        .eq("id", payout.order_id);

      return new Response(JSON.stringify({
        success: true,
        message: "Plata a fost retrimisă cu succes",
        stripe_transfer_id: transfer.id,
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
