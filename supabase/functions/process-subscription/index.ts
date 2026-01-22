import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Exchange rates (base: GBP = 1.00) - same as frontend
const EXCHANGE_RATES: Record<string, number> = {
  GBP: 1,
  EUR: 1.17,
  USD: 1.27,
  RON: 5.82,
  PLN: 5.06,
  CZK: 29.5,
  HUF: 460,
  BGN: 2.29,
  SEK: 13.5,
  DKK: 8.72,
  NOK: 13.8,
  CHF: 1.12,
};

// Country to currency mapping
const COUNTRY_CURRENCY: Record<string, string> = {
  GB: 'GBP', UK: 'GBP',
  US: 'USD',
  RO: 'RON',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', GR: 'EUR',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  BG: 'BGN',
  SE: 'SEK',
  DK: 'DKK',
  NO: 'NOK',
  CH: 'CHF',
};

interface SubscriptionRequest {
  action: 'check_expired' | 'charge' | 'activate' | 'cancel';
  user_id?: string;
  currency?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get MangoPay credentials
    const mangopayClientId = Deno.env.get("MANGOPAY_CLIENT_ID");
    const mangopayApiKey = Deno.env.get("MANGOPAY_API_KEY");
    const mangopayEnv = Deno.env.get("MANGOPAY_ENVIRONMENT") || "sandbox";

    const body: SubscriptionRequest = await req.json();
    const { action, user_id, currency } = body;

    // Base subscription amount in GBP
    const BASE_SUBSCRIPTION_GBP = 1.00;

    // Function to convert GBP to target currency
    const convertToLocalCurrency = (gbpAmount: number, targetCurrency: string): { amount: number; currency: string } => {
      const rate = EXCHANGE_RATES[targetCurrency] || 1;
      return {
        amount: Math.ceil(gbpAmount * rate * 100) / 100, // Round up to 2 decimals
        currency: targetCurrency,
      };
    };

    // Get user's preferred currency based on their country
    const getUserCurrency = async (userId: string): Promise<string> => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_country, country_of_residence')
        .eq('user_id', userId)
        .single();

      const country = profile?.kyc_country || profile?.country_of_residence || 'GB';
      return COUNTRY_CURRENCY[country] || 'GBP';
    };

    if (action === 'check_expired') {
      // Find all expired trial subscriptions
      const now = new Date().toISOString();
      
      const { data: expiredTrials, error: expiredError } = await supabase
        .from('seller_subscriptions')
        .select(`
          *,
          profiles!seller_subscriptions_user_id_fkey (
            user_id,
            display_name,
            kyc_country,
            country_of_residence,
            mangopay_user_id,
            mangopay_wallet_id
          )
        `)
        .eq('status', 'trial')
        .lt('trial_end_date', now);

      if (expiredError) throw expiredError;

      const results = [];

      for (const sub of expiredTrials || []) {
        const userCurrency = await getUserCurrency(sub.user_id);
        const localAmount = convertToLocalCurrency(BASE_SUBSCRIPTION_GBP, userCurrency);

        // Update subscription status to expired
        await supabase
          .from('seller_subscriptions')
          .update({ status: 'expired' })
          .eq('id', sub.id);

        // Send notification to user
        await supabase.from('notifications').insert({
          user_id: sub.user_id,
          type: 'subscription_expired',
          title: 'Perioada de Probă s-a Încheiat',
          message: `Abonamentul tău gratuit a expirat. Pentru a continua să vinzi, activează abonamentul de ${localAmount.amount.toFixed(2)} ${localAmount.currency}/lună.`,
          data: {
            subscription_id: sub.id,
            amount_gbp: BASE_SUBSCRIPTION_GBP,
            amount_local: localAmount.amount,
            currency: localAmount.currency,
          },
        });

        results.push({
          user_id: sub.user_id,
          status: 'expired',
          notification_sent: true,
          local_amount: localAmount,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          expired_count: results.length,
          results,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'charge' && user_id) {
      // Authenticate user
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("Authorization required");
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user || user.id !== user_id) {
        throw new Error("Invalid token or user mismatch");
      }

      // Get user's currency preference
      const userCurrency = currency || await getUserCurrency(user_id);
      const localAmount = convertToLocalCurrency(BASE_SUBSCRIPTION_GBP, userCurrency);

      // Get user's MangoPay wallet
      const { data: profile } = await supabase
        .from('profiles')
        .select('mangopay_user_id, mangopay_wallet_id, kyc_status')
        .eq('user_id', user_id)
        .single();

      if (!profile?.mangopay_user_id || !profile?.mangopay_wallet_id) {
        throw new Error('Please complete KYC verification first');
      }

      if (profile.kyc_status !== 'verified' && profile.kyc_status !== 'approved') {
        throw new Error('KYC verification pending. Please wait for approval.');
      }

      let paymentSuccess = false;
      let processorTransactionId = '';

      // Process payment via MangoPay if configured
      if (mangopayClientId && mangopayApiKey) {
        const mangopayBaseUrl = mangopayEnv === "production" 
          ? "https://api.mangopay.com" 
          : "https://api.sandbox.mangopay.com";

        try {
          // Create PayIn (direct debit from wallet)
          const payinResponse = await fetch(
            `${mangopayBaseUrl}/v2.01/${mangopayClientId}/payins/bankwire/direct`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${btoa(`${mangopayClientId}:${mangopayApiKey}`)}`,
              },
              body: JSON.stringify({
                AuthorId: profile.mangopay_user_id,
                CreditedWalletId: "PLATFORM_WALLET_ID", // Platform wallet for subscriptions
                DebitedFunds: {
                  Currency: userCurrency,
                  Amount: Math.round(localAmount.amount * 100), // Amount in cents
                },
                Fees: {
                  Currency: userCurrency,
                  Amount: 0,
                },
                DeclaredDebitedFunds: {
                  Currency: userCurrency,
                  Amount: Math.round(localAmount.amount * 100),
                },
                DeclaredFees: {
                  Currency: userCurrency,
                  Amount: 0,
                },
                Tag: `Subscription ${user_id}`,
              }),
            }
          );

          if (payinResponse.ok) {
            const payinData = await payinResponse.json();
            paymentSuccess = payinData.Status === 'SUCCEEDED' || payinData.Status === 'CREATED';
            processorTransactionId = payinData.Id;
          }
        } catch (e) {
          console.error("MangoPay payment error:", e);
        }
      } else {
        // Simulation mode - auto-succeed
        paymentSuccess = true;
        processorTransactionId = `SIM_SUB_${Date.now()}`;
      }

      if (paymentSuccess) {
        // Calculate next period end (1 month from now)
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        // Update subscription
        const { error: updateError } = await supabase
          .from('seller_subscriptions')
          .upsert({
            user_id: user_id,
            status: 'active',
            current_period_end: periodEnd.toISOString(),
            subscription_amount: localAmount.amount,
            payment_processor: mangopayClientId ? 'mangopay' : 'simulation',
            updated_at: new Date().toISOString(),
          });

        if (updateError) throw updateError;

        // Create payment record
        await supabase.from('payouts').insert({
          seller_id: user_id,
          order_id: null,
          gross_amount: localAmount.amount,
          net_amount: localAmount.amount,
          buyer_fee: 0,
          seller_commission: 0,
          status: 'completed',
          processed_at: new Date().toISOString(),
        });

        // Send success notification
        await supabase.from('notifications').insert({
          user_id: user_id,
          type: 'subscription_activated',
          title: 'Abonament Activat! ✅',
          message: `Abonamentul tău de ${localAmount.amount.toFixed(2)} ${localAmount.currency}/lună a fost activat cu succes.`,
          data: {
            amount: localAmount.amount,
            currency: localAmount.currency,
            next_payment: periodEnd.toISOString(),
            transaction_id: processorTransactionId,
          },
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Subscription activated successfully',
            subscription: {
              status: 'active',
              amount: localAmount.amount,
              currency: localAmount.currency,
              amount_gbp: BASE_SUBSCRIPTION_GBP,
              next_payment: periodEnd.toISOString(),
              transaction_id: processorTransactionId,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        throw new Error('Payment processing failed');
      }
    }

    if (action === 'activate' && user_id) {
      // For manual activation without payment (admin use)
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token || '');
      
      // Check if admin
      const { data: roleCheck } = await supabase
        .rpc('has_role', { _user_id: user?.id || '', _role: 'admin' });

      if (!roleCheck) {
        throw new Error('Admin access required');
      }

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabase
        .from('seller_subscriptions')
        .upsert({
          user_id: user_id,
          status: 'active',
          current_period_end: periodEnd.toISOString(),
          subscription_amount: BASE_SUBSCRIPTION_GBP,
          payment_processor: 'admin_manual',
        });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription activated by admin',
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'cancel' && user_id) {
      await supabase
        .from('seller_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription cancelled',
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Subscription processing error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});