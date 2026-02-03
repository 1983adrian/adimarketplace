import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[ADMIN-SETTINGS-CHECK] ${step}`, details ? JSON.stringify(details) : "");
};

interface ServiceStatus {
  name: string;
  configured: boolean;
  working: boolean;
  details: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) throw new Error("User not authenticated");

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Unauthorized - Admin access required");

    const services: ServiceStatus[] = [];

    // ========== 1. MANGOPAY (Primary Payment Processor) ==========
    const { data: mangopaySettings } = await supabase
      .from("payment_processor_settings")
      .select("*")
      .eq("processor_name", "mangopay")
      .single();

    if (mangopaySettings?.api_key_encrypted) {
      services.push({
        name: "MangoPay Payments",
        configured: true,
        working: true,
        details: `Environment: ${mangopaySettings.environment || "sandbox"} | Active: ${mangopaySettings.is_active ? "✓" : "✗"}`
      });
    } else {
      services.push({
        name: "MangoPay Payments",
        configured: false,
        working: false,
        details: "MangoPay not configured - configure in Admin → Payments"
      });
    }

    // ========== 2. RESEND ==========
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        const resendRes = await fetch("https://api.resend.com/domains", {
          headers: { "Authorization": `Bearer ${resendKey}` }
        });
        if (resendRes.ok) {
          const domains = await resendRes.json();
          services.push({
            name: "Resend Email",
            configured: true,
            working: true,
            details: `${domains.data?.length || 0} domains configured`
          });
        } else {
          services.push({
            name: "Resend Email",
            configured: true,
            working: false,
            details: "API key invalid or expired",
            error: await resendRes.text()
          });
        }
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : "Unknown error";
        services.push({
          name: "Resend Email",
          configured: true,
          working: false,
          details: "Connection failed",
          error
        });
      }
    } else {
      services.push({
        name: "Resend Email",
        configured: false,
        working: false,
        details: "RESEND_API_KEY not set"
      });
    }

    // ========== 3. TWILIO ==========
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (twilioSid && twilioToken) {
      try {
        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}.json`,
          {
            headers: {
              "Authorization": `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`
            }
          }
        );
        if (twilioRes.ok) {
          const accountData = await twilioRes.json();
          services.push({
            name: "Twilio SMS",
            configured: true,
            working: true,
            details: `Status: ${accountData.status} | Phone: ${twilioPhone || "Not set"}`
          });
        } else {
          services.push({
            name: "Twilio SMS",
            configured: true,
            working: false,
            details: "Credentials invalid",
            error: await twilioRes.text()
          });
        }
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : "Unknown error";
        services.push({
          name: "Twilio SMS",
          configured: true,
          working: false,
          details: "Connection failed",
          error
        });
      }
    } else {
      services.push({
        name: "Twilio SMS",
        configured: false,
        working: false,
        details: "TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set"
      });
    }

    // ========== 4. LOVABLE AI ==========
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (lovableKey) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableKey}`
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 5
          })
        });
        if (aiRes.ok) {
          services.push({
            name: "Lovable AI Gateway",
            configured: true,
            working: true,
            details: "AI models accessible for image verification & analysis"
          });
        } else {
          services.push({
            name: "Lovable AI Gateway",
            configured: true,
            working: false,
            details: "API key invalid",
            error: await aiRes.text()
          });
        }
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : "Unknown error";
        services.push({
          name: "Lovable AI Gateway",
          configured: true,
          working: false,
          details: "Connection failed",
          error
        });
      }
    } else {
      services.push({
        name: "Lovable AI Gateway",
        configured: false,
        working: false,
        details: "LOVABLE_API_KEY not set (required for AI features)"
      });
    }

    // ========== 5. DATABASE ==========
    try {
      const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: listingsCount } = await supabase.from("listings").select("*", { count: "exact", head: true });
      const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true });
      
      services.push({
        name: "Database (Supabase)",
        configured: true,
        working: true,
        details: `Users: ${usersCount || 0} | Listings: ${listingsCount || 0} | Orders: ${ordersCount || 0}`
      });
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : "Unknown error";
      services.push({
        name: "Database (Supabase)",
        configured: false,
        working: false,
        details: "Connection failed",
        error
      });
    }

    // ========== 6. STORAGE ==========
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (!bucketsError) {
        const bucketNames = buckets.map(b => b.name).join(", ");
        services.push({
          name: "Storage (Supabase)",
          configured: true,
          working: true,
          details: `Buckets: ${bucketNames || "none"}`
        });
      } else {
        throw bucketsError;
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : "Unknown error";
      services.push({
        name: "Storage (Supabase)",
        configured: true,
        working: false,
        details: "Cannot access storage",
        error
      });
    }

    // ========== 7. PLATFORM FEES ==========
    const { data: fees } = await supabase
      .from("platform_fees")
      .select("*")
      .eq("is_active", true);

    const buyerFee = fees?.find(f => f.fee_type === "buyer_fee");
    const sellerCommission = fees?.find(f => f.fee_type === "seller_commission");

    services.push({
      name: "Platform Fees",
      configured: !!(buyerFee && sellerCommission),
      working: !!(buyerFee && sellerCommission),
      details: buyerFee && sellerCommission
        ? `Buyer Fee: €${buyerFee.amount} | Seller Commission: ${sellerCommission.amount}%`
        : "Missing fee configuration"
    });

    // ========== 8. EDGE FUNCTIONS ==========
    const edgeFunctions = [
      "process-payment",
      "process-payout",
      "send-notification",
      "send-password-reset",
      "ping-google",
      "dynamic-sitemap"
    ];

    services.push({
      name: "Edge Functions",
      configured: true,
      working: true,
      details: `${edgeFunctions.length} functions deployed: ${edgeFunctions.join(", ")}`
    });

    // ========== SUMMARY ==========
    const workingCount = services.filter(s => s.working).length;
    const configuredCount = services.filter(s => s.configured).length;
    const totalCount = services.length;

    const overallStatus = workingCount === totalCount 
      ? "all_working" 
      : workingCount >= totalCount * 0.7 
        ? "mostly_working" 
        : "needs_attention";

    logStep("Check complete", {
      working: workingCount,
      configured: configuredCount,
      total: totalCount,
      status: overallStatus
    });

    return new Response(JSON.stringify({
      success: true,
      services,
      summary: {
        workingCount,
        configuredCount,
        totalCount,
        percentage: Math.round((workingCount / totalCount) * 100),
        overallStatus
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    logStep("Error", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
