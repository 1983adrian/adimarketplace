import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIAction {
  id: string;
  module: string;
  action: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  requiresConfirmation: boolean;
  data: Record<string, unknown>;
  suggestedAt: string;
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) throw new Error("No authorization token");

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

    const { module, action } = await req.json();

    // Fetch all necessary data
    const [ordersRes, usersRes, listingsRes, feesRes, disputesRes, conversationsRes] = await Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("profiles").select("*, user_roles(role)"),
      supabase.from("listings").select("*, categories(name), listing_images(image_url)"),
      supabase.from("platform_fees").select("*").eq("is_active", true),
      supabase.from("disputes").select("*"),
      supabase.from("conversations").select("*, messages(*)")
    ]);

    const orders = ordersRes.data || [];
    const users = usersRes.data || [];
    const listings = listingsRes.data || [];
    const fees = feesRes.data || [];
    const disputes = disputesRes.data || [];
    const conversations = conversationsRes.data || [];

    const today = new Date().toDateString();
    const paidStatuses = ["paid", "shipped", "delivered"];
    const paidOrders = orders.filter(o => paidStatuses.includes(o.status));

    // Calculate metrics
    const buyerFee = fees.find(f => f.fee_type === "buyer_fee")?.amount || 2;
    const sellerCommission = fees.find(f => f.fee_type === "seller_commission")?.amount || 15;

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount), 0);
    const platformEarnings = paidOrders.length * buyerFee + 
      paidOrders.reduce((sum, o) => sum + (Number(o.amount) * sellerCommission / 100), 0);

    // Build module-specific data
    const moduleData: Record<string, unknown> = {};
    const suggestedActions: AIAction[] = [];
    const alerts: Array<{ type: string; message: string; severity: string }> = [];

    // ==================== ADMIN MODULE ====================
    if (module === "admin" || module === "all") {
      const newUsersToday = users.filter(u => new Date(u.created_at).toDateString() === today).length;
      const totalSellers = users.filter(u => u.is_seller).length;
      const inactiveUsers = users.filter(u => {
        const daysSinceUpdate = (Date.now() - new Date(u.updated_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 30;
      });

      moduleData.admin = {
        totalUsers: users.length,
        newUsersToday,
        totalSellers,
        inactiveUsers: inactiveUsers.length,
        adminCount: users.filter(u => u.user_roles?.some((r: { role: string }) => r.role === "admin")).length,
        moderatorCount: users.filter(u => u.user_roles?.some((r: { role: string }) => r.role === "moderator")).length,
      };

      // Admin alerts
      if (inactiveUsers.length > 10) {
        alerts.push({
          type: "admin",
          message: `${inactiveUsers.length} utilizatori inactivi de peste 30 de zile`,
          severity: "low"
        });
      }

      // Suggested actions
      if (newUsersToday > 10) {
        suggestedActions.push({
          id: crypto.randomUUID(),
          module: "admin",
          action: "send_welcome_campaign",
          description: `${newUsersToday} utilizatori noi astăzi - trimite campanie de bun venit`,
          severity: "low",
          requiresConfirmation: true,
          data: { userCount: newUsersToday },
          suggestedAt: new Date().toISOString()
        });
      }
    }

    // ==================== SALES MODULE ====================
    if (module === "sales" || module === "all") {
      const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
      const pendingOrders = orders.filter(o => o.status === "pending");
      const cancelledOrders = orders.filter(o => o.status === "cancelled" || o.status === "refunded");
      
      // Detect suspicious patterns
      const buyerOrderCounts: Record<string, number> = {};
      const sellerCancellations: Record<string, number> = {};
      
      orders.forEach(o => {
        buyerOrderCounts[o.buyer_id] = (buyerOrderCounts[o.buyer_id] || 0) + 1;
      });
      
      cancelledOrders.forEach(o => {
        sellerCancellations[o.seller_id] = (sellerCancellations[o.seller_id] || 0) + 1;
      });

      const suspiciousBuyers = Object.entries(buyerOrderCounts)
        .filter(([_, count]) => count > 20)
        .map(([userId, count]) => ({ userId, orderCount: count }));

      const problematicSellers = Object.entries(sellerCancellations)
        .filter(([_, count]) => count >= 3)
        .map(([userId, count]) => ({ userId, cancellations: count }));

      moduleData.sales = {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + Number(o.amount), 0),
        pendingOrders: pendingOrders.length,
        paidOrders: paidOrders.length,
        cancelledOrders: cancelledOrders.length,
        totalRevenue,
        platformEarnings,
        averageOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
        conversionRate: orders.length > 0 ? (paidOrders.length / orders.length * 100).toFixed(1) : 0,
        suspiciousBuyers,
        problematicSellers
      };

      // Sales alerts
      if (pendingOrders.length > 10) {
        alerts.push({
          type: "sales",
          message: `${pendingOrders.length} comenzi în așteptare necesită atenție`,
          severity: "medium"
        });
      }

      // Old pending orders
      const oldPending = pendingOrders.filter(o => {
        const days = (Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return days > 3;
      });
      if (oldPending.length > 0) {
        alerts.push({
          type: "sales",
          message: `${oldPending.length} comenzi în așteptare de peste 3 zile`,
          severity: "high"
        });
        suggestedActions.push({
          id: crypto.randomUUID(),
          module: "sales",
          action: "cancel_old_pending",
          description: `Anulează ${oldPending.length} comenzi vechi nefinalizate`,
          severity: "medium",
          requiresConfirmation: true,
          data: { orderIds: oldPending.map(o => o.id) },
          suggestedAt: new Date().toISOString()
        });
      }

      problematicSellers.forEach(seller => {
        suggestedActions.push({
          id: crypto.randomUUID(),
          module: "sales",
          action: "review_seller",
          description: `Analizează vânzătorul cu ${seller.cancellations} comenzi anulate`,
          severity: "medium",
          requiresConfirmation: true,
          data: { userId: seller.userId, cancellations: seller.cancellations },
          suggestedAt: new Date().toISOString()
        });
      });
    }

    // ==================== MODERATION MODULE ====================
    if (module === "moderation" || module === "all") {
      const openDisputes = disputes.filter(d => d.status === "open" || d.status === "pending");
      const resolvedDisputes = disputes.filter(d => d.status === "resolved");
      
      // Check for potentially problematic listings (no images, very low/high prices)
      const problematicListings = listings.filter(l => {
        const hasNoImages = !l.listing_images || l.listing_images.length === 0;
        const suspiciousPrice = l.price < 1 || l.price > 10000;
        return hasNoImages || suspiciousPrice;
      });

      // Check for spam patterns in messages
      const messagesByUser: Record<string, number> = {};
      conversations.forEach(c => {
        c.messages?.forEach((m: { sender_id: string }) => {
          messagesByUser[m.sender_id] = (messagesByUser[m.sender_id] || 0) + 1;
        });
      });
      const potentialSpammers = Object.entries(messagesByUser)
        .filter(([_, count]) => count > 100)
        .map(([userId, count]) => ({ userId, messageCount: count }));

      moduleData.moderation = {
        openDisputes: openDisputes.length,
        resolvedDisputes: resolvedDisputes.length,
        totalDisputes: disputes.length,
        problematicListings: problematicListings.length,
        potentialSpammers: potentialSpammers.length,
        activeListings: listings.filter(l => l.is_active).length,
        inactiveListings: listings.filter(l => !l.is_active).length,
      };

      // Moderation alerts
      if (openDisputes.length > 0) {
        alerts.push({
          type: "moderation",
          message: `${openDisputes.length} dispute deschise necesită rezolvare`,
          severity: openDisputes.length > 5 ? "high" : "medium"
        });
      }

      if (problematicListings.length > 0) {
        suggestedActions.push({
          id: crypto.randomUUID(),
          module: "moderation",
          action: "review_listings",
          description: `Verifică ${problematicListings.length} anunțuri suspecte (fără poze sau prețuri extreme)`,
          severity: "medium",
          requiresConfirmation: true,
          data: { listingIds: problematicListings.slice(0, 10).map(l => l.id) },
          suggestedAt: new Date().toISOString()
        });
      }

      potentialSpammers.forEach(spammer => {
        suggestedActions.push({
          id: crypto.randomUUID(),
          module: "moderation",
          action: "investigate_spammer",
          description: `Investigă utilizatorul cu ${spammer.messageCount} mesaje trimise`,
          severity: "high",
          requiresConfirmation: true,
          data: { userId: spammer.userId },
          suggestedAt: new Date().toISOString()
        });
      });
    }

    // ==================== ADS MODULE ====================
    if (module === "ads" || module === "all") {
      // Simulated ads data - in production would come from a promotions table
      const promotedListings = listings.filter(l => l.is_active).slice(0, 5);
      
      moduleData.ads = {
        activePromotions: promotedListings.length,
        totalImpressions: Math.floor(Math.random() * 10000) + 1000,
        totalClicks: Math.floor(Math.random() * 500) + 50,
        ctr: ((Math.random() * 5) + 1).toFixed(2),
        adSpend: (Math.random() * 500 + 100).toFixed(2),
        topPerformingCategories: ["Electronics", "Fashion", "Home"],
        suggestedBudget: (totalRevenue * 0.05).toFixed(2),
      };

      // Ads suggestions
      if (listings.length > 50 && promotedListings.length < 10) {
        suggestedActions.push({
          id: crypto.randomUUID(),
          module: "ads",
          action: "increase_promotions",
          description: "Recomand creșterea numărului de anunțuri promovate pentru mai multă vizibilitate",
          severity: "low",
          requiresConfirmation: true,
          data: { currentPromoted: promotedListings.length, suggested: 10 },
          suggestedAt: new Date().toISOString()
        });
      }
    }

    // ==================== FINANCE MODULE ====================
    if (module === "finance" || module === "all") {
      const pendingPayouts = orders.filter(o => 
        o.status === "delivered" && o.payout_status !== "completed"
      );
      const pendingPayoutAmount = pendingPayouts.reduce((sum, o) => {
        const net = Number(o.amount) - (Number(o.amount) * sellerCommission / 100);
        return sum + net;
      }, 0);

      const refundedOrders = orders.filter(o => o.status === "refunded");
      const refundedAmount = refundedOrders.reduce((sum, o) => sum + Number(o.amount), 0);

      moduleData.finance = {
        totalRevenue,
        platformEarnings,
        buyerFeesCollected: paidOrders.length * buyerFee,
        sellerCommissions: paidOrders.reduce((sum, o) => sum + (Number(o.amount) * sellerCommission / 100), 0),
        pendingPayoutsCount: pendingPayouts.length,
        pendingPayoutsAmount: pendingPayoutAmount,
        refundedAmount,
        refundRate: orders.length > 0 ? ((refundedOrders.length / orders.length) * 100).toFixed(2) : 0,
        projectedMonthlyRevenue: (totalRevenue / 30 * 30).toFixed(2),
      };

      // Finance alerts
      if (pendingPayoutAmount > 1000) {
        alerts.push({
          type: "finance",
          message: `£${pendingPayoutAmount.toFixed(2)} în plăți restante către vânzători`,
          severity: "high"
        });
        suggestedActions.push({
          id: crypto.randomUUID(),
          module: "finance",
          action: "process_payouts",
          description: `Procesează ${pendingPayouts.length} plăți restante (£${pendingPayoutAmount.toFixed(2)})`,
          severity: "high",
          requiresConfirmation: true,
          data: { orderIds: pendingPayouts.map(o => o.id), amount: pendingPayoutAmount },
          suggestedAt: new Date().toISOString()
        });
      }

      const financeData = moduleData.finance as { refundRate: string };
      if (Number(financeData.refundRate) > 10) {
        alerts.push({
          type: "finance",
          message: `Rata de rambursare ridicată: ${financeData.refundRate}%`,
          severity: "critical"
        });
      }
    }

    // ==================== AI ANALYSIS ====================
    if (action === "analyze") {
      const analysisPrompt = `Ești AI Manager pentru marketplace-ul AdiMarket. Analizează datele și oferă:

1. **Sumar Executiv** (3-4 propoziții)
2. **Top 3 Priorități** pentru proprietar
3. **Riscuri Detectate** (dacă există)
4. **Recomandări de Acțiune** (concrete și specifice)
5. **Predicții** pentru următoarea săptămână

Date curente:
- Utilizatori: ${users.length} total, ${users.filter(u => u.is_seller).length} vânzători
- Comenzi: ${orders.length} total, ${paidOrders.length} plătite, ${orders.filter(o => o.status === "pending").length} în așteptare
- Venituri: £${totalRevenue.toFixed(2)} total, £${platformEarnings.toFixed(2)} câștig platformă
- Dispute: ${disputes.filter(d => d.status === "open").length} deschise
- Anunțuri: ${listings.length} total, ${listings.filter(l => l.is_active).length} active

Alerte active: ${alerts.length}
Acțiuni sugerate: ${suggestedActions.length}

Răspunde în română, structurat și profesional.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Ești AI Manager expert pentru marketplace-uri. Analizezi date și oferi recomandări strategice. Răspunzi în română." },
            { role: "user", content: analysisPrompt }
          ],
          max_tokens: 2000
        })
      });

      let analysis = "Analiza AI nu este disponibilă momentan.";
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        analysis = aiData.choices?.[0]?.message?.content || analysis;
      } else {
        console.error("AI Gateway error:", await aiResponse.text());
      }

      return new Response(JSON.stringify({
        success: true,
        moduleData,
        alerts,
        suggestedActions,
        analysis,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default response without AI analysis
    return new Response(JSON.stringify({
      success: true,
      moduleData,
      alerts,
      suggestedActions,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("AI Manager error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
