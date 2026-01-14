import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SalesData {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  platformEarnings: number;
  buyerFees: number;
  sellerCommissions: number;
  averageOrderValue: number;
  todayOrders: number;
  todayRevenue: number;
  topSellers: Array<{ name: string; sales: number; revenue: number }>;
  recentSuspiciousActivity: Array<{ userId: string; reason: string; severity: string }>;
  pendingPayouts: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      throw new Error("No authorization token");
    }

    const { data: userData } = await supabaseClient.auth.getUser(token);
    if (!userData.user) throw new Error("User not authenticated");

    // Check admin role
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Unauthorized - Admin access required");

    const { action } = await req.json();

    // Fetch sales data
    const { data: orders } = await supabaseClient
      .from("orders")
      .select(`
        id, amount, status, created_at, buyer_id, seller_id,
        buyer_fee, seller_commission, payout_status
      `);

    const { data: fees } = await supabaseClient
      .from("platform_fees")
      .select("*")
      .eq("is_active", true);

    const { data: profiles } = await supabaseClient
      .from("profiles")
      .select("user_id, display_name, store_name");

    const buyerFeeAmount = fees?.find(f => f.fee_type === "buyer_fee")?.amount || 2;
    const sellerCommissionRate = fees?.find(f => f.fee_type === "seller_commission")?.amount || 15;

    const today = new Date().toDateString();
    const todayOrders = orders?.filter(o => new Date(o.created_at).toDateString() === today) || [];
    
    const paidStatuses = ["paid", "shipped", "delivered"];
    const paidOrders = orders?.filter(o => paidStatuses.includes(o.status)) || [];
    const pendingOrders = orders?.filter(o => o.status === "pending") || [];
    const shippedOrders = orders?.filter(o => o.status === "shipped") || [];
    const deliveredOrders = orders?.filter(o => o.status === "delivered") || [];
    const cancelledOrders = orders?.filter(o => o.status === "cancelled" || o.status === "refunded") || [];

    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.amount), 0);
    
    const buyerFees = paidOrders.length * buyerFeeAmount;
    const sellerCommissions = paidOrders.reduce((sum, o) => sum + (Number(o.amount) * sellerCommissionRate / 100), 0);
    const platformEarnings = buyerFees + sellerCommissions;

    // Calculate top sellers
    const sellerSales: Record<string, { sales: number; revenue: number }> = {};
    paidOrders.forEach(order => {
      if (!sellerSales[order.seller_id]) {
        sellerSales[order.seller_id] = { sales: 0, revenue: 0 };
      }
      sellerSales[order.seller_id].sales += 1;
      sellerSales[order.seller_id].revenue += Number(order.amount);
    });

    const topSellers = Object.entries(sellerSales)
      .map(([userId, data]) => {
        const profile = profiles?.find(p => p.user_id === userId);
        return {
          name: profile?.store_name || profile?.display_name || "Unknown",
          userId,
          ...data
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Detect suspicious activity (basic rules)
    const suspiciousActivity: Array<{ userId: string; reason: string; severity: string }> = [];
    
    // Rule 1: Multiple cancelled orders by same buyer
    const buyerCancellations: Record<string, number> = {};
    cancelledOrders.forEach(o => {
      buyerCancellations[o.buyer_id] = (buyerCancellations[o.buyer_id] || 0) + 1;
    });
    Object.entries(buyerCancellations).forEach(([userId, count]) => {
      if (count >= 3) {
        suspiciousActivity.push({
          userId,
          reason: `${count} comenzi anulate de acest cumpărător`,
          severity: count >= 5 ? "high" : "medium"
        });
      }
    });

    // Rule 2: High value orders pending for too long
    const oldPendingOrders = pendingOrders.filter(o => {
      const daysSincePending = (Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSincePending > 3 && Number(o.amount) > 100;
    });
    oldPendingOrders.forEach(o => {
      suspiciousActivity.push({
        userId: o.buyer_id,
        reason: `Comandă de £${o.amount} în așteptare de peste 3 zile`,
        severity: "medium"
      });
    });

    // Pending payouts
    const pendingPayouts = orders?.filter(o => 
      o.status === "delivered" && o.payout_status !== "completed"
    ).reduce((sum, o) => sum + Number(o.amount) - (Number(o.amount) * sellerCommissionRate / 100), 0) || 0;

    const salesData: SalesData = {
      totalOrders: orders?.length || 0,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      shippedOrders: shippedOrders.length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalRevenue,
      platformEarnings,
      buyerFees,
      sellerCommissions,
      averageOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
      todayOrders: todayOrders.length,
      todayRevenue,
      topSellers,
      recentSuspiciousActivity: suspiciousActivity,
      pendingPayouts
    };

    if (action === "analyze") {
      // Call Lovable AI for analysis
      const aiPrompt = `Tu ești AI Sales Manager pentru o platformă marketplace. Analizează următoarele date de vânzări și oferă:
1. Un sumar executiv (2-3 propoziții)
2. 3 sugestii concrete pentru îmbunătățirea vânzărilor
3. Alerte sau riscuri detectate
4. O predicție pentru următoarea săptămână

Date:
- Total comenzi: ${salesData.totalOrders}
- Comenzi plătite: ${salesData.paidOrders}
- Comenzi în așteptare: ${salesData.pendingOrders}
- Comenzi livrate: ${salesData.deliveredOrders}
- Comenzi anulate: ${salesData.cancelledOrders}
- Venituri totale: £${salesData.totalRevenue.toFixed(2)}
- Câștiguri platformă: £${salesData.platformEarnings.toFixed(2)}
- Valoare medie comandă: £${salesData.averageOrderValue.toFixed(2)}
- Comenzi astăzi: ${salesData.todayOrders}
- Venituri astăzi: £${salesData.todayRevenue.toFixed(2)}
- Plăți în așteptare către vânzători: £${salesData.pendingPayouts.toFixed(2)}
- Activități suspecte: ${salesData.recentSuspiciousActivity.length}

Top vânzători:
${salesData.topSellers.map((s, i) => `${i+1}. ${s.name}: ${s.sales} vânzări, £${s.revenue.toFixed(2)}`).join('\n')}

Răspunde în limba română, structurat și concis.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Ești un AI Sales Manager expert în analiză de date pentru marketplace-uri. Răspunzi în română, clar și structurat." },
            { role: "user", content: aiPrompt }
          ],
          max_tokens: 1500
        })
      });

      if (!aiResponse.ok) {
        console.error("AI Gateway error:", await aiResponse.text());
        return new Response(JSON.stringify({ 
          salesData,
          analysis: "Analiza AI nu este disponibilă momentan. Verificați datele manual."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const aiData = await aiResponse.json();
      const analysis = aiData.choices?.[0]?.message?.content || "Nu s-a putut genera analiza.";

      return new Response(JSON.stringify({ salesData, analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Default: return sales data without AI analysis
    return new Response(JSON.stringify({ salesData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("Error in ai-sales-manager:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
