import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  action: 'check_expired' | 'activate' | 'cancel';
  user_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SubscriptionRequest = await req.json();
    const { action, user_id } = body;

    if (action === 'check_expired') {
      // Find all expired trial subscriptions
      const now = new Date().toISOString();
      
      const { data: expiredTrials, error: expiredError } = await supabase
        .from('seller_subscriptions')
        .select('*')
        .eq('status', 'trial')
        .lt('trial_end_date', now);

      if (expiredError) throw expiredError;

      const results = [];

      for (const sub of expiredTrials || []) {
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
          message: 'Abonamentul tău gratuit a expirat. Pentru a continua să vinzi, activează un plan de abonament.',
          data: {
            subscription_id: sub.id,
          },
        });

        results.push({
          user_id: sub.user_id,
          status: 'expired',
          notification_sent: true,
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

    if (action === 'activate' && user_id) {
      // Manual activation by admin only
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
