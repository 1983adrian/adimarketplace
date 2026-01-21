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
  fixedAt?: string;
  fixResult?: string;
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
  autoFixLog: string[];
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

    const { action, issueId } = await req.json();

    const issues: MaintenanceIssue[] = [];
    let issuesFixed = 0;
    const autoFixLog: string[] = [];

    // ==================== DATABASE HEALTH CHECKS ====================
    
    // Check for orphaned orders
    const { data: orphanedOrders } = await supabase
      .from("orders")
      .select("id, listing_id")
      .is("listing_id", null);
    
    if (orphanedOrders && orphanedOrders.length > 0) {
      issues.push({
        id: "db_orphaned_orders",
        category: "data_integrity",
        severity: "warning",
        title: "Comenzi fără listing asociat",
        description: `${orphanedOrders.length} comenzi au referințe către listinguri șterse - se vor marca ca "listing_deleted"`,
        autoFixable: true,
        fixAction: "mark_orphaned_orders",
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
        description: `${profilesWithoutRoles.length} utilizatori nu au un rol atribuit în sistem - se va atribui rol "user"`,
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
        description: `${listingsWithInvalidCategories.length} listinguri referințiază categorii care nu există - se vor reseta`,
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
          description: `${duplicates.length} vânzători au listinguri cu titluri identice - necesită revizuire`,
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
        description: `${staleOrders.length} comenzi sunt în status "pending" de peste 7 zile - se vor anula automat`,
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
        description: `${listingsWithoutImages.length} listinguri active nu au nicio imagine - se vor dezactiva`,
        autoFixable: true,
        fixAction: "deactivate_imageless_listings",
        detectedAt: new Date().toISOString()
      });
    }

    // ==================== AUTH & SECURITY CHECKS ====================
    
    // Check for users without profiles
    const { data: usersData } = await supabase.auth.admin.listUsers();
    let usersWithoutProfiles: typeof usersData.users = [];
    
    if (usersData?.users) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id");
      
      const profileUserIds = new Set(profiles?.map(p => p.user_id) || []);
      usersWithoutProfiles = usersData.users.filter(u => !profileUserIds.has(u.id));
      
      if (usersWithoutProfiles.length > 0) {
        issues.push({
          id: "auth_missing_profiles",
          category: "auth",
          severity: "critical",
          title: "Utilizatori fără profil",
          description: `${usersWithoutProfiles.length} utilizatori autentificați nu au profil creat - se vor crea automat`,
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
    
    if (adminRoles && adminRoles.length > 5) {
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

    // ==================== SECURITY SETTINGS CHECK ====================
    
    // Check platform security settings
    const { data: securitySettings } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "security_advanced")
      .single();
    
    let securityIssues: string[] = [];
    if (securitySettings?.value) {
      const settings = securitySettings.value as Record<string, unknown>;
      const auth = settings.authentication as Record<string, unknown> || {};
      const rateLimit = settings.rateLimit as Record<string, unknown> || {};
      
      if (!auth.twoFactorEnabled) securityIssues.push("2FA dezactivat");
      if (!auth.leakedPasswordProtection) securityIssues.push("Protecție parole compromise dezactivată");
      if (!rateLimit.enabled) securityIssues.push("Rate limiting dezactivat");
    }
    
    if (securityIssues.length > 0) {
      issues.push({
        id: "security_settings_weak",
        category: "security",
        severity: "critical",
        title: "Setări de securitate slabe",
        description: `Probleme detectate: ${securityIssues.join(", ")} - se vor activa automat`,
        autoFixable: true,
        fixAction: "enable_security_features",
        detectedAt: new Date().toISOString()
      });
    }

    // ==================== PERFORMANCE CHECKS ====================
    
    // Check for large tables
    const { count: listingsCount } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true });
    
    if (listingsCount && listingsCount > 10000) {
      issues.push({
        id: "perf_large_listings_table",
        category: "performance",
        severity: "info",
        title: "Tabel listings mare",
        description: "Tabelul listings conține peste 10,000 înregistrări - consideră arhivarea",
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
        description: `${expiredPromotions.length} promoții expirate sunt încă marcate ca active - se vor dezactiva`,
        autoFixable: true,
        fixAction: "deactivate_expired_promotions",
        detectedAt: new Date().toISOString()
      });
    }

    // Check for conversations without messages
    const { data: emptyConversations } = await supabase
      .from("conversations")
      .select(`
        id,
        messages!left(id)
      `)
      .is("messages", null);
    
    if (emptyConversations && emptyConversations.length > 10) {
      issues.push({
        id: "data_empty_conversations",
        category: "data_integrity",
        severity: "info",
        title: "Conversații goale",
        description: `${emptyConversations.length} conversații nu au niciun mesaj - vor fi păstrate pentru audit`,
        autoFixable: false,
        detectedAt: new Date().toISOString()
      });
    }

    // ==================== AUTO-FIX FUNCTION ====================
    const executeAutoFix = async (issue: MaintenanceIssue): Promise<string> => {
      try {
        switch (issue.fixAction) {
          case "assign_default_roles":
            if (profilesWithoutRoles) {
              let fixed = 0;
              for (const profile of profilesWithoutRoles) {
                const { error } = await supabase.from("user_roles").insert({
                  user_id: profile.user_id,
                  role: "user"
                });
                if (!error) fixed++;
              }
              return `✅ Atribuit rol "user" la ${fixed} utilizatori`;
            }
            return "⚠️ Nu s-au găsit utilizatori de reparat";

          case "clear_invalid_categories":
            if (listingsWithInvalidCategories) {
              const ids = listingsWithInvalidCategories.map(l => l.id);
              const { error } = await supabase
                .from("listings")
                .update({ category_id: null })
                .in("id", ids);
              if (!error) return `✅ Resetat ${ids.length} categorii invalide`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit listinguri de reparat";

          case "cancel_stale_orders":
            if (staleOrders) {
              const ids = staleOrders.map(o => o.id);
              const { error } = await supabase
                .from("orders")
                .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
                .in("id", ids);
              if (!error) return `✅ Anulat ${ids.length} comenzi vechi`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit comenzi de anulat";

          case "deactivate_expired_promotions":
            if (expiredPromotions) {
              const ids = expiredPromotions.map(p => p.id);
              const { error } = await supabase
                .from("listing_promotions")
                .update({ is_active: false })
                .in("id", ids);
              if (!error) return `✅ Dezactivat ${ids.length} promoții expirate`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit promoții de dezactivat";

          case "create_missing_profiles":
            if (usersWithoutProfiles.length > 0) {
              let created = 0;
              for (const user of usersWithoutProfiles) {
                const { error: profileError } = await supabase.from("profiles").insert({
                  user_id: user.id,
                  display_name: user.email?.split("@")[0] || "User"
                });
                if (!profileError) {
                  await supabase.from("user_roles").insert({
                    user_id: user.id,
                    role: "user"
                  });
                  created++;
                }
              }
              return `✅ Creat ${created} profile noi cu rol "user"`;
            }
            return "⚠️ Nu s-au găsit utilizatori fără profil";

          case "mark_orphaned_orders":
            if (orphanedOrders) {
              const ids = orphanedOrders.map(o => o.id);
              const { error } = await supabase
                .from("orders")
                .update({ processor_error: "listing_deleted" })
                .in("id", ids);
              if (!error) return `✅ Marcat ${ids.length} comenzi ca "listing_deleted"`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit comenzi orfane";

          case "deactivate_imageless_listings":
            if (listingsWithoutImages) {
              const ids = listingsWithoutImages.map(l => l.id);
              const { error } = await supabase
                .from("listings")
                .update({ is_active: false })
                .in("id", ids);
              if (!error) return `✅ Dezactivat ${ids.length} listinguri fără imagini`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit listinguri fără imagini";

          case "enable_security_features":
            // Activează toate funcțiile de securitate
            const securityConfig = {
              authentication: {
                twoFactorEnabled: true,
                twoFactorMethod: "email",
                leakedPasswordProtection: true,
                passwordMinLength: 12,
                passwordRequireUppercase: true,
                passwordRequireNumbers: true,
                passwordRequireSymbols: true,
                maxLoginAttempts: 5,
                lockoutDuration: 30,
                sessionTimeout: 60,
                rememberMeMaxDays: 30
              },
              rateLimit: {
                enabled: true,
                maxRequests: 100,
                windowSeconds: 60,
                loginMaxAttempts: 5,
                loginWindowSeconds: 300
              },
              ipSecurity: {
                blockVPN: false,
                blockTor: true,
                geoRestriction: false,
                allowedCountries: [],
                blockedCountries: []
              },
              sessionSecurity: {
                forceLogoutOnPasswordChange: true,
                singleSession: false,
                deviceTracking: true
              },
              notifications: {
                newLogin: true,
                suspiciousActivity: true,
                passwordChange: true,
                adminActions: true
              }
            };
            
            const { error: secError } = await supabase
              .from("platform_settings")
              .upsert({
                key: "security_advanced",
                value: securityConfig,
                updated_at: new Date().toISOString()
              }, { onConflict: "key" });
            
            if (!secError) return "✅ Activat toate funcțiile de securitate: 2FA, leak protection, rate limiting";
            return `❌ Eroare la activare securitate: ${secError.message}`;

          default:
            return `⚠️ Acțiune necunoscută: ${issue.fixAction}`;
        }
      } catch (error) {
        return `❌ Excepție: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    };

    // ==================== EXECUTE SINGLE FIX ====================
    if (action === "auto_fix" && issueId) {
      const issue = issues.find(i => i.id === issueId);
      if (issue && issue.autoFixable) {
        const result = await executeAutoFix(issue);
        autoFixLog.push(`[${issue.id}] ${result}`);
        if (result.startsWith("✅")) issuesFixed++;
      }
    }

    // ==================== FULL AUTO REPAIR ====================
    if (action === "full_auto_repair") {
      const fixableIssues = issues.filter(i => i.autoFixable);
      for (const issue of fixableIssues) {
        const result = await executeAutoFix(issue);
        autoFixLog.push(`[${issue.id}] ${result}`);
        if (result.startsWith("✅")) {
          issuesFixed++;
          issue.fixedAt = new Date().toISOString();
          issue.fixResult = result;
        }
      }
    }

    // ==================== CALCULATE HEALTH SCORES ====================
    const calculateCategoryHealth = (category: MaintenanceIssue["category"]) => {
      const categoryIssues = issues.filter(i => i.category === category && !i.fixedAt);
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
      const analysisPrompt = `Ești AI Maintenance Manager AVANSAT pentru platforma AdiMarket cu PUTERE COMPLETĂ de reparare.

CAPACITĂȚI COMPLETE:
- Repari automat TOATE problemele detectate
- Activezi setări de securitate
- Optimizezi performanța bazei de date
- Creezi profile și roluri lipsă
- Anulezi comenzi blocate
- Dezactivezi promoții expirate

RAPORT SCANARE:
${issues.map(i => `- [${i.severity.toUpperCase()}] ${i.title}: ${i.description} ${i.fixedAt ? "✅ REPARAT" : i.autoFixable ? "🔧 Se poate repara automat" : "📋 Necesită atenție manuală"}`).join("\n")}

ACȚIUNI EXECUTATE:
${autoFixLog.length > 0 ? autoFixLog.join("\n") : "Nicio acțiune executată încă"}

SCORURI SĂNĂTATE (după reparații):
- Database: ${systemHealth.database}%
- Storage: ${systemHealth.storage}%
- Auth: ${systemHealth.auth}%
- Data Integrity: ${systemHealth.dataIntegrity}%
- Performance: ${systemHealth.performance}%
- Security: ${systemHealth.security}%
- Overall: ${systemHealth.overall}%

STATISTICI:
- Probleme detectate: ${issues.length}
- Probleme reparate: ${issuesFixed}
- Probleme rămase: ${issues.filter(i => !i.fixedAt).length}

Oferă un RAPORT COMPLET cu:
1. Sumar executiv - ce s-a reparat
2. Ce rămâne de făcut manual
3. Recomandări pentru prevenire
4. Score de sănătate actualizat

Răspunde în română, structurat și acționabil.`;

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
                content: "Ești AI Maintenance Manager cu PUTERE COMPLETĂ de reparare automată. Ai executat deja reparările - acum oferă un raport detaliat. Răspunzi în română." 
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
    
    if (issuesFixed > 0) {
      recommendations.push(`🔧 ${issuesFixed} probleme au fost reparate automat în această sesiune`);
    }
    
    const remainingIssues = issues.filter(i => !i.fixedAt);
    if (remainingIssues.length > 0) {
      recommendations.push(`📋 ${remainingIssues.length} probleme necesită atenție manuală`);
    }
    
    if (systemHealth.security < 100) {
      recommendations.push("🔒 Verifică politicile RLS și setările de securitate");
    }
    if (systemHealth.dataIntegrity < 80) {
      recommendations.push("📊 Execută o verificare manuală a integrității datelor");
    }
    if (systemHealth.auth < 90) {
      recommendations.push("👤 Verifică procesul de înregistrare și rolurile utilizatorilor");
    }
    if (systemHealth.overall === 100) {
      recommendations.push("✨ Platforma funcționează perfect - nicio acțiune necesară!");
    }

    const status: MaintenanceReport["status"] = 
      issues.some(i => i.severity === "critical" && !i.fixedAt) ? "critical" :
      issues.some(i => !i.fixedAt) ? "issues_detected" : "healthy";

    const report: MaintenanceReport = {
      timestamp: new Date().toISOString(),
      status,
      issuesFound: issues.length,
      issuesFixed,
      issues,
      systemHealth,
      aiAnalysis: aiAnalysis || undefined,
      recommendations,
      autoFixLog
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
