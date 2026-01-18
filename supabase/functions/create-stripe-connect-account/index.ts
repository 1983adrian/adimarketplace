import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT] ${step}${detailsStr}`);
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { action } = await req.json().catch(() => ({ action: 'create' }));

    // Check if user already has a Stripe Connect account
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id, display_name')
      .eq('user_id', user.id)
      .single();

    if (action === 'status') {
      // Return the current connection status
      if (profile?.stripe_account_id) {
        try {
          const account = await stripe.accounts.retrieve(profile.stripe_account_id);
          return new Response(JSON.stringify({
            connected: true,
            accountId: profile.stripe_account_id,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (err) {
          logStep("Error fetching Stripe account", { error: err });
        }
      }
      return new Response(JSON.stringify({ connected: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let accountId = profile?.stripe_account_id;

    // Create a new Connect account if one doesn't exist
    if (!accountId) {
      logStep("Creating new Stripe Connect account");
      
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'GB',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          user_id: user.id,
        },
      });

      accountId = account.id;
      logStep("Stripe Connect account created", { accountId });

      // Save the account ID to the user's profile
      await supabaseClient
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('user_id', user.id);
    }

    // Create an account link for onboarding
    const origin = req.headers.get("origin") || "https://adimarketplace.lovable.app";
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/settings?tab=payouts&refresh=true`,
      return_url: `${origin}/settings?tab=payouts&connected=true`,
      type: 'account_onboarding',
    });

    logStep("Account link created", { url: accountLink.url });

    return new Response(JSON.stringify({
      url: accountLink.url,
      accountId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
