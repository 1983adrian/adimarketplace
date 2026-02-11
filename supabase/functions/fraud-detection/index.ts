import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FraudCheckRequest {
  user_id?: string;
  action: "check_user" | "check_listing" | "check_withdrawal" | "scan_platform";
  listing_id?: string;
  ip_address?: string;
  user_agent?: string;
}

interface FraudAlert {
  user_id: string;
  alert_type: string;
  severity: "warning" | "critical";
  title: string;
  description: string;
  evidence: any[];
  auto_action_taken: string | null;
  listing_id?: string;
  related_user_ids?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // STRICT AUTH: Only service_role OR verified admin users
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized: No auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isServiceRole = authHeader === `Bearer ${supabaseServiceKey}`;
    let callerUserId: string | null = null;

    if (!isServiceRole) {
      // Verify the user is an admin
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
      
      if (claimsError || !claimsData?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      callerUserId = claimsData.claims.sub as string;

      // Check admin role using service_role client
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: isAdmin } = await adminClient.rpc("has_role", {
        _user_id: callerUserId,
        _role: "admin",
      });

      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Use service_role client for all fraud operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: FraudCheckRequest = await req.json();
    const alerts: FraudAlert[] = [];

    // ======================
    // 1. CHECK USER FRAUD
    // ======================
    if (body.action === "check_user" && body.user_id) {
      // Check for duplicate accounts (same IP)
      if (body.ip_address) {
        const { data: sameIpUsers } = await supabase
          .from("audit_logs")
          .select("admin_id")
          .eq("ip_address", body.ip_address)
          .neq("admin_id", body.user_id)
          .limit(10);

        if (sameIpUsers && sameIpUsers.length > 2) {
          const relatedIds = [...new Set(sameIpUsers.map(u => u.admin_id))];
          alerts.push({
            user_id: body.user_id,
            alert_type: "multiple_accounts",
            severity: "critical",
            title: "Detectate Conturi Multiple",
            description: `Utilizatorul partajează IP (${body.ip_address}) cu ${relatedIds.length} alte conturi`,
            evidence: [{ type: "ip_match", ip: body.ip_address, related_users: relatedIds }],
            auto_action_taken: null,
            related_user_ids: relatedIds,
          });
        }
      }

      // Check for rapid listing creation (possible spam)
      const { data: recentListings } = await supabase
        .from("listings")
        .select("id, created_at")
        .eq("seller_id", body.user_id)
        .gte("created_at", new Date(Date.now() - 3600000).toISOString())
        .order("created_at", { ascending: false });

      if (recentListings && recentListings.length > 10) {
        alerts.push({
          user_id: body.user_id,
          alert_type: "spam_listings",
          severity: "warning",
          title: "Activitate Suspectă de Listare",
          description: `${recentListings.length} anunțuri create în ultima oră`,
          evidence: [{ type: "rapid_listing", count: recentListings.length }],
          auto_action_taken: null,
        });
      }

      // Check for shill bidding (bidding on own listings)
      const { data: userListingIds } = await supabase
        .from("listings")
        .select("id")
        .eq("seller_id", body.user_id);

      if (userListingIds && userListingIds.length > 0) {
        const listingIds = userListingIds.map(l => l.id);
        const { data: selfBids } = await supabase
          .from("bids")
          .select("id, listing_id, amount")
          .eq("bidder_id", body.user_id)
          .in("listing_id", listingIds);

        if (selfBids && selfBids.length > 0) {
          alerts.push({
            user_id: body.user_id,
            alert_type: "shill_bidding",
            severity: "critical",
            title: "Licitație pe Propriul Produs Detectată",
            description: `Utilizatorul a licitat pe ${selfBids.length} dintre propriile anunțuri`,
            evidence: selfBids,
            auto_action_taken: "listing_suspended",
          });

          for (const bid of selfBids) {
            await supabase
              .from("listings")
              .update({ is_active: false })
              .eq("id", bid.listing_id);
          }
        }
      }
    }

    // ======================
    // 2. CHECK LISTING FRAUD
    // ======================
    if (body.action === "check_listing" && body.listing_id) {
      const { data: listing } = await supabase
        .from("listings")
        .select("*")
        .eq("id", body.listing_id)
        .single();

      if (listing) {
        // Check prohibited items
        const { data: prohibitedItems } = await supabase
          .from("prohibited_items")
          .select("keyword, severity")
          .eq("is_active", true);

        if (prohibitedItems) {
          const titleLower = listing.title?.toLowerCase() || "";
          const descLower = listing.description?.toLowerCase() || "";
          
          for (const item of prohibitedItems) {
            if (titleLower.includes(item.keyword.toLowerCase()) || 
                descLower.includes(item.keyword.toLowerCase())) {
              alerts.push({
                user_id: listing.seller_id,
                alert_type: "prohibited_item",
                severity: item.severity === "critical" ? "critical" : "warning",
                title: "Produs Interzis Detectat",
                description: `Anunțul "${listing.title}" conține cuvântul interzis: "${item.keyword}"`,
                evidence: [{ keyword: item.keyword, listing_id: body.listing_id }],
                auto_action_taken: "listing_deactivated",
                listing_id: body.listing_id,
              });

              await supabase
                .from("listings")
                .update({ is_active: false })
                .eq("id", body.listing_id);
              break;
            }
          }
        }

        // Check for price manipulation
        const { data: priceHistory } = await supabase
          .from("price_history")
          .select("price, recorded_at")
          .eq("listing_id", body.listing_id)
          .order("recorded_at", { ascending: false })
          .limit(5);

        if (priceHistory && priceHistory.length >= 2) {
          const currentPrice = priceHistory[0].price;
          const previousPrice = priceHistory[1].price;
          const changePercent = Math.abs((currentPrice - previousPrice) / previousPrice * 100);

          if (changePercent > 80) {
            alerts.push({
              user_id: listing.seller_id,
              alert_type: "price_manipulation",
              severity: "warning",
              title: "Manipulare Preț Suspectă",
              description: `Prețul a fost modificat cu ${changePercent.toFixed(0)}% (de la ${previousPrice} la ${currentPrice})`,
              evidence: priceHistory,
              auto_action_taken: null,
              listing_id: body.listing_id,
            });
          }
        }
      }
    }

    // ======================
    // 3. CHECK WITHDRAWAL FRAUD
    // ======================
    if (body.action === "check_withdrawal" && body.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, kyc_status, payout_balance, created_at, withdrawal_blocked")
        .eq("user_id", body.user_id)
        .single();

      if (profile) {
        if (profile.kyc_status !== "approved") {
          alerts.push({
            user_id: body.user_id,
            alert_type: "kyc_incomplete",
            severity: "warning",
            title: "Extragere fără KYC Complet",
            description: "Utilizatorul încearcă să extragă fonduri fără verificare KYC aprobată",
            evidence: [{ kyc_status: profile.kyc_status }],
            auto_action_taken: "withdrawal_blocked",
          });
        }

        // Check for rapid consecutive withdrawals
        const { data: recentPayouts } = await supabase
          .from("payouts")
          .select("id, net_amount, created_at")
          .eq("seller_id", body.user_id)
          .gte("created_at", new Date(Date.now() - 86400000).toISOString())
          .order("created_at", { ascending: false });

        if (recentPayouts && recentPayouts.length > 5) {
          const totalAmount = recentPayouts.reduce((sum, p) => sum + (p.net_amount || 0), 0);
          alerts.push({
            user_id: body.user_id,
            alert_type: "suspicious_withdrawal",
            severity: "critical",
            title: "Pattern Extragere Suspectă",
            description: `${recentPayouts.length} cereri de extragere în 24h, total: ${totalAmount.toFixed(2)} LEI`,
            evidence: recentPayouts.slice(0, 5),
            auto_action_taken: "withdrawal_blocked",
          });

          await supabase
            .from("profiles")
            .update({
              withdrawal_blocked: true,
              withdrawal_blocked_reason: "Multiple withdrawal attempts in 24h - pending review",
              withdrawal_blocked_at: new Date().toISOString(),
            })
            .eq("user_id", body.user_id);
        }

        // Check for new accounts with large balances
        const accountAge = Date.now() - new Date(profile.created_at).getTime();
        const accountDays = accountAge / (1000 * 60 * 60 * 24);
        
        if (accountDays < 7 && (profile.payout_balance || 0) > 500) {
          alerts.push({
            user_id: body.user_id,
            alert_type: "new_account_high_balance",
            severity: "warning",
            title: "Cont Nou cu Sold Mare",
            description: `Cont de ${accountDays.toFixed(0)} zile cu sold de ${profile.payout_balance?.toFixed(2)} LEI`,
            evidence: [{ account_days: accountDays, balance: profile.payout_balance }],
            auto_action_taken: null,
          });
        }
      }
    }

    // ======================
    // 4. PLATFORM SCAN (admin-only via auth check above)
    // ======================
    if (body.action === "scan_platform") {
      const { data: stuckOrders } = await supabase
        .from("orders")
        .select("id, seller_id, created_at")
        .eq("status", "pending")
        .lt("created_at", new Date(Date.now() - 7 * 86400000).toISOString());

      if (stuckOrders && stuckOrders.length > 0) {
        for (const order of stuckOrders.slice(0, 10)) {
          alerts.push({
            user_id: order.seller_id,
            alert_type: "stuck_order",
            severity: "warning",
            title: "Comandă Blocată",
            description: `Comandă în așteptare de mai mult de 7 zile`,
            evidence: [{ order_id: order.id, created_at: order.created_at }],
            auto_action_taken: null,
          });
        }
      }
    }

    // ======================
    // SAVE ALERTS TO DATABASE
    // ======================
    if (alerts.length > 0) {
      for (const alert of alerts) {
        await supabase.from("fraud_alerts").insert({
          user_id: alert.user_id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          evidence: alert.evidence,
          listing_id: alert.listing_id || null,
          related_user_ids: alert.related_user_ids || [],
          auto_action_taken: alert.auto_action_taken,
          status: "pending",
        });

        const scoreIncrease = alert.severity === "critical" ? 25 : 10;
        await supabase.rpc("increment_fraud_score", {
          p_user_id: alert.user_id,
          p_score: scoreIncrease,
        });

        // Audit log
        await supabase.from("audit_logs").insert({
          admin_id: callerUserId || body.user_id || "00000000-0000-0000-0000-000000000000",
          action: "fraud_alert_created",
          entity_type: "fraud_alert",
          entity_id: alert.user_id,
          new_values: alert,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: alerts.length,
        alerts: alerts.map(a => ({
          type: a.alert_type,
          severity: a.severity,
          title: a.title,
          auto_action: a.auto_action_taken,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Fraud detection error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
