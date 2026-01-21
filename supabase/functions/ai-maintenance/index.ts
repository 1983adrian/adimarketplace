import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MaintenanceIssue {
  id: string;
  category: "database" | "storage" | "auth" | "edge_functions" | "data_integrity" | "performance" | "security";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  autoFixable: boolean;
  fixAction?: string;
  fixQuery?: string;
  detectedAt: string;
}

interface MaintenanceReport {
  timestamp: string;
  status: "healthy" | "issues_detected" | "critical";
  issuesFound: number;
  issuesFixed: number;
  issues: MaintenanceIssue[];
  systemHealth: {
    database: number;
    storage: number;
    auth: number;
    edgeFunctions: number;
    dataIntegrity: number;
    performance: number;
    security: number;
    overall: number;
  };
  aiAnalysis?: string;
  recommendations: string[];
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

    const { action, issueId, customFix } = await req.json();

    const issues: MaintenanceIssue[] = [];
    let issuesFixed = 0;

    // ==================== DATABASE HEALTH CHECKS ====================
    
    // Check for orphaned records (info only - no deletion)
    const { data: orphanedOrders } = await supabase
      .from("orders")
      .select("id, listing_id")
      .is("listing_id", null);
    
    if (orphanedOrders && orphanedOrders.length > 0) {
      issues.push({
        id: "db_orphaned_orders",
        category: "data_integrity",
        severity: "info",
        title: "Comenzi fără listing asociat",
        description: `${orphanedOrders.length} comenzi au referințe către listinguri care nu mai există - necesită revizuire manuală`,
        autoFixable: false, // NU se șterge - doar raportare
        detectedAt: new Date().toISOString()
      });
    }

    // Check for profiles without user_roles
    const { data: profilesWithoutRoles } = await supabase
      .from("profiles")
      .select(`
        user_id,
        user_roles!left(role)
      `)
      .is("user_roles", null);
    
    if (profilesWithoutRoles && profilesWithoutRoles.length > 0) {
      issues.push({
        id: "db_missing_roles",
        category: "auth",
        severity: "error",
        title: "Utilizatori fără roluri atribuite",
        description: `${profilesWithoutRoles.length} utilizatori nu au un rol atribuit în sistem`,
        autoFixable: true,
        fixAction: "assign_default_roles",
        detectedAt: new Date().toISOString()
      });
    }

    // Check for listings with invalid categories
    const { data: listingsWithInvalidCategories } = await supabase
      .from("listings")
      .select(`
        id,
        category_id,
        categories!left(id)
      `)
      .is("categories", null)
      .not("category_id", "is", null);
    
    if (listingsWithInvalidCategories && listingsWithInvalidCategories.length > 0) {
      issues.push({
        id: "db_invalid_categories",
        category: "data_integrity",
        severity: "warning",
        title: "Listinguri cu categorii invalide",
        description: `${listingsWithInvalidCategories.length} listinguri referințiază categorii care nu există`,
        autoFixable: true,
        fixAction: "clear_invalid_categories",
        detectedAt: new Date().toISOString()
      });
    }

    // Check for duplicate active listings
    const { data: duplicateListings } = await supabase
      .from("listings")
      .select("title, seller_id")
      .eq("is_active", true);
    
    if (duplicateListings) {
      const seen = new Map<string, number>();
      duplicateListings.forEach(l => {
        const key = `${l.seller_id}_${l.title}`;
        seen.set(key, (seen.get(key) || 0) + 1);
      });
      const duplicates = Array.from(seen.entries()).filter(([_, count]) => count > 1);
      if (duplicates.length > 0) {
        issues.push({
          id: "db_duplicate_listings",
          category: "data_integrity",
          severity: "info",
          title: "Listinguri duplicate detectate",
          description: `${duplicates.length} vânzători au listinguri cu titluri identice`,
          autoFixable: false,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // Check for stale pending orders (older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: staleOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("status", "pending")
      .lt("created_at", sevenDaysAgo);
    
    if (staleOrders && staleOrders.length > 0) {
      issues.push({
        id: "db_stale_orders",
        category: "data_integrity",
        severity: "warning",
        title: "Comenzi în așteptare vechi",
        description: `${staleOrders.length} comenzi sunt în status "pending" de peste 7 zile`,
        autoFixable: true,
        fixAction: "cancel_stale_orders",
        detectedAt: new Date().toISOString()
      });
    }

    // ==================== STORAGE HEALTH CHECKS ====================
    
    // Check for listings without images
    const { data: listingsWithoutImages } = await supabase
      .from("listings")
      .select(`
        id,
        is_active,
        listing_images!left(id)
      `)
      .eq("is_active", true)
      .is("listing_images", null);
    
    if (listingsWithoutImages && listingsWithoutImages.length > 0) {
      issues.push({
        id: "storage_missing_images",
        category: "storage",
        severity: "warning",
        title: "Listinguri active fără imagini",
        description: `${listingsWithoutImages.length} listinguri active nu au nicio imagine`,
        autoFixable: false,
        detectedAt: new Date().toISOString()
      });
    }

    // ==================== AUTH & SECURITY CHECKS ====================
    
    // Check for users without profiles
    const { data: usersData } = await supabase.auth.admin.listUsers();
    if (usersData?.users) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id");
      
      const profileUserIds = new Set(profiles?.map(p => p.user_id) || []);
      const usersWithoutProfiles = usersData.users.filter(u => !profileUserIds.has(u.id));
      
      if (usersWithoutProfiles.length > 0) {
        issues.push({
          id: "auth_missing_profiles",
          category: "auth",
          severity: "critical",
          title: "Utilizatori fără profil",
          description: `${usersWithoutProfiles.length} utilizatori autentificați nu au profil creat`,
          autoFixable: true,
          fixAction: "create_missing_profiles",
          detectedAt: new Date().toISOString()
        });
      }

      // Check for unconfirmed users older than 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const unconfirmedUsers = usersData.users.filter(
        u => !u.confirmed_at && new Date(u.created_at) < oneDayAgo
      );
      
      if (unconfirmedUsers.length > 0) {
        issues.push({
          id: "auth_unconfirmed_users",
          category: "auth",
          severity: "info",
          title: "Utilizatori neconfirmați vechi",
          description: `${unconfirmedUsers.length} utilizatori nu și-au confirmat emailul de peste 24 ore`,
          autoFixable: false,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // Check for users with multiple admin roles
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    
    if (adminRoles && adminRoles.length > 3) {
      issues.push({
        id: "security_too_many_admins",
        category: "security",
        severity: "warning",
        title: "Prea mulți administratori",
        description: `${adminRoles.length} utilizatori au rol de admin - verifică dacă toți sunt necesari`,
        autoFixable: false,
        detectedAt: new Date().toISOString()
      });
    }

    // ==================== PERFORMANCE CHECKS ====================
    
    // Check for large tables without indexes (simulated)
    const { data: largeListings } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true });
    
    if (largeListings && (largeListings as any).count > 10000) {
      issues.push({
        id: "perf_large_listings_table",
        category: "performance",
        severity: "info",
        title: "Tabel listings mare",
        description: "Tabelul listings conține peste 10,000 înregistrări - consideră optimizarea query-urilor",
        autoFixable: false,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for expired promotions still marked active
    const { data: expiredPromotions } = await supabase
      .from("listing_promotions")
      .select("id")
      .eq("is_active", true)
      .lt("end_date", new Date().toISOString());
    
    if (expiredPromotions && expiredPromotions.length > 0) {
      issues.push({
        id: "data_expired_promotions",
        category: "data_integrity",
        severity: "warning",
        title: "Promoții expirate active",
        description: `${expiredPromotions.length} promoții expirate sunt încă marcate ca active`,
        autoFixable: true,
        fixAction: "deactivate_expired_promotions",
        detectedAt: new Date().toISOString()
      });
    }

    // Check for conversations without messages (info only - no deletion allowed)
    const { data: emptyConversations } = await supabase
      .from("conversations")
      .select(`
        id,
        messages!left(id)
      `)
      .is("messages", null);
    
    if (emptyConversations && emptyConversations.length > 5) {
      issues.push({
        id: "data_empty_conversations",
        category: "data_integrity",
        severity: "info",
        title: "Conversații goale",
        description: `${emptyConversations.length} conversații nu au niciun mesaj - necesită atenție manuală`,
        autoFixable: false, // NU se șterge - doar raportare
        detectedAt: new Date().toISOString()
      });
    }

    // ==================== EXECUTE AUTO-FIX ====================
    if (action === "auto_fix" && issueId) {
      const issue = issues.find(i => i.id === issueId);
      if (issue && issue.autoFixable) {
        try {
          switch (issue.fixAction) {
            case "assign_default_roles":
              if (profilesWithoutRoles) {
                for (const profile of profilesWithoutRoles) {
                  await supabase.from("user_roles").insert({
                    user_id: profile.user_id,
                    role: "user"
                  });
                }
                issuesFixed++;
              }
              break;

            case "clear_invalid_categories":
              if (listingsWithInvalidCategories) {
                const ids = listingsWithInvalidCategories.map(l => l.id);
                await supabase
                  .from("listings")
                  .update({ category_id: null })
                  .in("id", ids);
                issuesFixed++;
              }
              break;

            case "cancel_stale_orders":
              if (staleOrders) {
                const ids = staleOrders.map(o => o.id);
                await supabase
                  .from("orders")
                  .update({ status: "cancelled" })
                  .in("id", ids);
                issuesFixed++;
              }
              break;

            case "deactivate_expired_promotions":
              if (expiredPromotions) {
                const ids = expiredPromotions.map(p => p.id);
                await supabase
                  .from("listing_promotions")
                  .update({ is_active: false })
                  .in("id", ids);
                issuesFixed++;
              }
              break;

            // REMOVED: delete_empty_conversations - AI Maintenance NU are voie să șteargă date
            // Conversațiile goale sunt raportate pentru revizuire manuală

            case "create_missing_profiles":
              if (usersData?.users) {
                const { data: existingProfiles } = await supabase
                  .from("profiles")
                  .select("user_id");
                const existingIds = new Set(existingProfiles?.map(p => p.user_id) || []);
                
                for (const user of usersData.users) {
                  if (!existingIds.has(user.id)) {
                    await supabase.from("profiles").insert({
                      user_id: user.id,
                      display_name: user.email?.split("@")[0] || "User"
                    });
                    await supabase.from("user_roles").insert({
                      user_id: user.id,
                      role: "user"
                    });
                  }
                }
                issuesFixed++;
              }
              break;
          }
        } catch (fixError) {
          console.error("Auto-fix error:", fixError);
        }
      }
    }

    // ==================== FULL AUTO REPAIR ====================
    if (action === "full_auto_repair") {
      const fixableIssues = issues.filter(i => i.autoFixable);
      for (const issue of fixableIssues) {
        try {
          // Recursively fix each issue
          const fixResponse = await supabase.functions.invoke("ai-maintenance", {
            body: { action: "auto_fix", issueId: issue.id }
          });
          if (!fixResponse.error) {
            issuesFixed++;
          }
        } catch (e) {
          console.error(`Failed to fix ${issue.id}:`, e);
        }
      }
    }

    // ==================== CALCULATE HEALTH SCORES ====================
    const calculateCategoryHealth = (category: MaintenanceIssue["category"]) => {
      const categoryIssues = issues.filter(i => i.category === category);
      if (categoryIssues.length === 0) return 100;
      
      let penalty = 0;
      categoryIssues.forEach(i => {
        switch (i.severity) {
          case "critical": penalty += 40; break;
          case "error": penalty += 25; break;
          case "warning": penalty += 10; break;
          case "info": penalty += 5; break;
        }
      });
      
      return Math.max(0, 100 - penalty);
    };

    const systemHealth = {
      database: calculateCategoryHealth("database"),
      storage: calculateCategoryHealth("storage"),
      auth: calculateCategoryHealth("auth"),
      edgeFunctions: calculateCategoryHealth("edge_functions"),
      dataIntegrity: calculateCategoryHealth("data_integrity"),
      performance: calculateCategoryHealth("performance"),
      security: calculateCategoryHealth("security"),
      overall: 0
    };

    systemHealth.overall = Math.round(
      (systemHealth.database + systemHealth.storage + systemHealth.auth + 
       systemHealth.edgeFunctions + systemHealth.dataIntegrity + 
       systemHealth.performance + systemHealth.security) / 7
    );

    // ==================== AI ANALYSIS ====================
    let aiAnalysis = null;
    if (action === "analyze" || action === "full_auto_repair") {
      const analysisPrompt = `Ești AI Maintenance Manager pentru platforma AdiMarket. Analizează următoarele probleme detectate și oferă:

1. **Sumar General** - starea generală a platformei
2. **Priorități Imediate** - ce trebuie reparat urgent
3. **Recomandări Tehnice** - cum să previi problemele în viitor
4. **Optimizări Sugerate** - îmbunătățiri pentru performanță

Probleme detectate:
${issues.map(i => `- [${i.severity.toUpperCase()}] ${i.title}: ${i.description}`).join("\n")}

Scoruri sănătate sistem:
- Database: ${systemHealth.database}%
- Storage: ${systemHealth.storage}%
- Auth: ${systemHealth.auth}%
- Data Integrity: ${systemHealth.dataIntegrity}%
- Performance: ${systemHealth.performance}%
- Security: ${systemHealth.security}%
- Overall: ${systemHealth.overall}%

${issuesFixed > 0 ? `\n✅ ${issuesFixed} probleme au fost reparate automat.` : ""}

Răspunde în română, structurat și concis.`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { 
                role: "system", 
                content: "Ești un expert în mentenanță și DevOps pentru platforme marketplace. Oferi analize tehnice precise și soluții practice. IMPORTANT: Ai voie doar să REPARI și să ÎNTREȚII platforma - NU ai voie să ștergi date. Toate operațiunile de ștergere sunt INTERZISE. Răspunzi în română." 
              },
              { role: "user", content: analysisPrompt }
            ],
            max_tokens: 2000
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiAnalysis = aiData.choices?.[0]?.message?.content || null;
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    // ==================== GENERATE RECOMMENDATIONS ====================
    const recommendations: string[] = [];
    
    if (systemHealth.dataIntegrity < 80) {
      recommendations.push("Rulează o curățare completă a datelor orfane");
    }
    if (systemHealth.auth < 90) {
      recommendations.push("Verifică procesul de înregistrare și confirmarea email-urilor");
    }
    if (systemHealth.security < 95) {
      recommendations.push("Revizuiește politicile RLS și rolurile utilizatorilor");
    }
    if (issues.some(i => i.severity === "critical")) {
      recommendations.push("Rezolvă problemele critice înainte de a continua operațiunile normale");
    }
    if (issuesFixed > 0) {
      recommendations.push(`${issuesFixed} probleme au fost reparate - verifică log-urile pentru detalii`);
    }

    const status: MaintenanceReport["status"] = 
      issues.some(i => i.severity === "critical") ? "critical" :
      issues.length > 0 ? "issues_detected" : "healthy";

    const report: MaintenanceReport = {
      timestamp: new Date().toISOString(),
      status,
      issuesFound: issues.length,
      issuesFixed,
      issues,
      systemHealth,
      aiAnalysis: aiAnalysis || undefined,
      recommendations
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("AI Maintenance error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
