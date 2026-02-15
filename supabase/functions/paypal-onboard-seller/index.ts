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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, paypal_email } = await req.json();

    if (action === "save-email") {
      if (!paypal_email || !paypal_email.includes("@")) {
        return new Response(
          JSON.stringify({ error: "Email PayPal invalid" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cleanEmail = paypal_email.trim().toLowerCase();

      // Save to profile using service role for security
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      const { error } = await adminClient
        .from("profiles")
        .update({ paypal_email: cleanEmail })
        .eq("user_id", user.id);

      if (error) throw error;

      // Log the action for audit
      await adminClient.from("financial_audit_log").insert({
        user_id: user.id,
        action: "paypal_email_updated",
        entity_type: "profile",
        entity_id: user.id,
        new_value: { email_domain: cleanEmail.split("@")[1] },
      });

      return new Response(
        JSON.stringify({ success: true, email: cleanEmail }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get-status") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("paypal_email")
        .eq("user_id", user.id)
        .single();

      const email = (profile as any)?.paypal_email || null;

      return new Response(
        JSON.stringify({
          connected: !!email,
          email: email,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("PayPal onboard error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
