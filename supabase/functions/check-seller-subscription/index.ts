import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SELLER-SUBSCRIPTION] ${step}${detailsStr}`);
};

// 3 month free trial period in milliseconds
const TRIAL_PERIOD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First check when the user account was created
    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("created_at")
      .eq("user_id", user.id)
      .single();

    const accountCreatedAt = profileData?.created_at ? new Date(profileData.created_at) : new Date();
    const now = new Date();
    const accountAgeMs = now.getTime() - accountCreatedAt.getTime();
    const isInTrialPeriod = accountAgeMs < TRIAL_PERIOD_MS;
    const trialEndsAt = new Date(accountCreatedAt.getTime() + TRIAL_PERIOD_MS);
    const trialDaysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

    logStep("Account age check", { 
      accountCreatedAt: accountCreatedAt.toISOString(), 
      isInTrialPeriod, 
      trialDaysRemaining 
    });

    // If user is in trial period, they can create listings without subscription
    if (isInTrialPeriod) {
      logStep("User is in free trial period");
      
      // Update local subscription record with trial status
      await supabaseClient
        .from("seller_subscriptions")
        .upsert({
          user_id: user.id,
          status: "trial",
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: trialEndsAt.toISOString(),
        }, { onConflict: "user_id" });

      return new Response(JSON.stringify({ 
        subscribed: true,
        status: "trial",
        subscription_end: trialEndsAt.toISOString(),
        canCreateListings: true,
        isTrialPeriod: true,
        trialDaysRemaining,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // After trial, check for active Stripe subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, trial expired, user needs subscription");
      
      // Update local subscription record
      await supabaseClient
        .from("seller_subscriptions")
        .upsert({
          user_id: user.id,
          status: "trial_expired",
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: null,
        }, { onConflict: "user_id" });

      return new Response(JSON.stringify({ 
        subscribed: false,
        status: "trial_expired",
        canCreateListings: false,
        trialExpired: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;
    let subscriptionId = null;
    let status = "inactive";

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionId = subscription.id;
      status = "active";
      logStep("Active subscription found", { subscriptionId, endDate: subscriptionEnd });
    } else {
      logStep("No active subscription found");
    }

    // Update local subscription record
    await supabaseClient
      .from("seller_subscriptions")
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: status,
        current_period_end: subscriptionEnd,
      }, { onConflict: "user_id" });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      status: status,
      subscription_end: subscriptionEnd,
      canCreateListings: hasActiveSub,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
