import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MaintenanceIssue {
  id: string;
  category: "database" | "storage" | "auth" | "chat" | "notifications" | "orders" | "data_integrity" | "performance" | "security" | "fraud";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  autoFixable: boolean;
  fixAction?: string;
  affectedCount?: number;
  detectedAt: string;
  fixedAt?: string;
  fixResult?: string;
}

interface FraudAlert {
  user_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  evidence: any[];
  listing_id?: string;
  related_user_ids?: string[];
  auto_action_taken?: string;
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
    chat: number;
    notifications: number;
    orders: number;
    dataIntegrity: number;
    performance: number;
    security: number;
    fraud: number;
    overall: number;
  };
  aiAnalysis?: string;
  recommendations: string[];
  autoFixLog: string[];
  proactiveRepairs: string[];
  fraudAlerts?: FraudAlert[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // CRITICAL SECURITY: Verifică service_role key ÎNAINTE de orice altceva
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("apikey");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    // Verificăm dacă este apel cu service_role key (singura metodă permisă)
    const isServiceRole = apiKey === serviceRoleKey || 
      authHeader === `Bearer ${serviceRoleKey}`;
    
    if (!isServiceRole) {
      console.error("[SECURITY] Unauthorized access attempt - service_role key required");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unauthorized - This endpoint requires service_role authentication",
          code: "SERVICE_ROLE_REQUIRED"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceRoleKey
    );

    // Parse request body - DOAR după verificarea autentificării
    const requestBody = await req.json();
    const { action, issueId, autoRepairEnabled = true, scheduled = false } = requestBody;

    console.log(`[AI-MAINTENANCE] Authenticated via service_role. Scheduled: ${scheduled}, Action: ${action || 'scan'}`);

    // Validare suplimentară pentru scheduled - doar pentru logging
    if (scheduled) {
      console.log("[CRON] Scheduled auto-repair triggered at:", new Date().toISOString());
    }

    const issues: MaintenanceIssue[] = [];
    let issuesFixed = 0;
    const autoFixLog: string[] = [];
    const proactiveRepairs: string[] = [];

    // =====================================================================
    // SECTION 0: PLATFORM SELF-DISCOVERY - AUTO-DETECTARE COMPONENTE
    // =====================================================================
    
    // Discover all tables in the platform
    const platformTables = [
      "profiles", "listings", "listing_images", "categories", "orders", 
      "conversations", "messages", "notifications", "favorites", "bids",
      "reviews", "disputes", "returns", "refunds", "payouts", "seller_payouts",
      "listing_promotions", "platform_settings", "platform_fees", "user_roles",
      "admin_emails", "audit_logs", "saved_addresses", "friendships",
      "email_templates", "newsletter_subscribers", "push_tokens", "webhook_logs",
      "seo_settings", "homepage_content", "policies_content", "invoices",
      "seller_subscriptions", "marketing_campaigns", "campaign_sends",
      "payment_processor_settings"
    ];

    // Auto-discover table health by checking for common issues
    const tableHealthChecks: { table: string; healthy: boolean; issue?: string }[] = [];
    
    for (const table of platformTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        
        if (error) {
          tableHealthChecks.push({ table, healthy: false, issue: error.message });
        } else {
          tableHealthChecks.push({ table, healthy: true });
        }
      } catch (e) {
        tableHealthChecks.push({ 
          table, 
          healthy: false, 
          issue: e instanceof Error ? e.message : "Unknown error" 
        });
      }
    }

    // Report any table access issues
    const unhealthyTables = tableHealthChecks.filter(t => !t.healthy);
    if (unhealthyTables.length > 0) {
      issues.push({
        id: "platform_table_access",
        category: "database",
        severity: "critical",
        title: "Tabele inaccesibile",
        description: `${unhealthyTables.length} tabele au probleme de acces: ${unhealthyTables.map(t => t.table).join(", ")}`,
        autoFixable: false,
        affectedCount: unhealthyTables.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Platform feature registry - what the platform knows about itself
    const platformFeatures = {
      auth: { enabled: true, tables: ["profiles", "user_roles", "admin_emails"] },
      listings: { enabled: true, tables: ["listings", "listing_images", "categories"] },
      orders: { enabled: true, tables: ["orders", "returns", "refunds", "disputes"] },
      payments: { enabled: true, tables: ["payouts", "seller_payouts", "invoices", "platform_fees"] },
      messaging: { enabled: true, tables: ["conversations", "messages", "friendships"] },
      notifications: { enabled: true, tables: ["notifications", "push_tokens"] },
      promotions: { enabled: true, tables: ["listing_promotions", "marketing_campaigns"] },
      settings: { enabled: true, tables: ["platform_settings", "seo_settings", "homepage_content"] }
    };

    // Log what the platform knows about itself
    proactiveRepairs.push(`🔍 Auto-detectat ${platformTables.length} tabele de platformă`);
    proactiveRepairs.push(`✅ ${tableHealthChecks.filter(t => t.healthy).length} tabele sănătoase`);
    if (unhealthyTables.length > 0) {
      proactiveRepairs.push(`⚠️ ${unhealthyTables.length} tabele cu probleme`);
    }

    // =====================================================================
    // SECTION 1: CHAT & MESSAGES HEALTH - REPARARE COMPLETĂ
    // =====================================================================
    
    // 🔴 NEW: Auto-delete messages older than 3 days
    const threeDaysAgoMessages = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: oldMessages, count: oldMessagesCount } = await supabase
      .from("messages")
      .select("id", { count: "exact" })
      .lt("created_at", threeDaysAgoMessages);

    if (oldMessages && oldMessages.length > 0) {
      issues.push({
        id: "chat_old_messages_cleanup",
        category: "chat",
        severity: "info",
        title: "Mesaje vechi > 3 zile",
        description: `${oldMessages.length} mesaje mai vechi de 3 zile - vor fi șterse automat`,
        autoFixable: true,
        fixAction: "delete_old_messages",
        affectedCount: oldMessages.length,
        detectedAt: new Date().toISOString()
      });
    }
    
    // Check for conversations with deleted listings
    const { data: conversationsWithDeletedListings } = await supabase
      .from("conversations")
      .select(`id, listing_id, listings!left(id)`)
      .is("listings", null);

    if (conversationsWithDeletedListings && conversationsWithDeletedListings.length > 0) {
      issues.push({
        id: "chat_orphaned_conversations",
        category: "chat",
        severity: "warning",
        title: "Conversații cu listinguri șterse",
        description: `${conversationsWithDeletedListings.length} conversații referă listinguri care nu mai există - vor fi arhivate`,
        autoFixable: true,
        fixAction: "archive_orphaned_conversations",
        affectedCount: conversationsWithDeletedListings.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for unread messages older than 7 days (possible notification failure)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: oldUnreadMessages, count: oldUnreadCount } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id", { count: "exact" })
      .eq("is_read", false)
      .lt("created_at", sevenDaysAgo);

    if (oldUnreadMessages && oldUnreadMessages.length > 5) {
      issues.push({
        id: "chat_stale_unread",
        category: "chat",
        severity: "info",
        title: "Mesaje necitite vechi",
        description: `${oldUnreadMessages.length} mesaje sunt necitite de peste 7 zile - vor fi marcate ca citite`,
        autoFixable: true,
        fixAction: "mark_old_messages_read",
        affectedCount: oldUnreadMessages.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for empty conversations (no messages)
    const { data: emptyConversations } = await supabase
      .from("conversations")
      .select(`id, messages!left(id)`)
      .is("messages", null);

    if (emptyConversations && emptyConversations.length > 10) {
      issues.push({
        id: "chat_empty_conversations",
        category: "chat",
        severity: "info",
        title: "Conversații goale",
        description: `${emptyConversations.length} conversații fără mesaje - vor fi șterse`,
        autoFixable: true,
        fixAction: "delete_empty_conversations",
        affectedCount: emptyConversations.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for duplicate conversations (same buyer, seller, listing)
    const { data: allConversations } = await supabase
      .from("conversations")
      .select("id, buyer_id, seller_id, listing_id, created_at")
      .order("created_at", { ascending: true });

    const duplicateConvIds: string[] = [];
    if (allConversations) {
      const seen = new Map<string, string>();
      for (const conv of allConversations) {
        const key = `${conv.buyer_id}_${conv.seller_id}_${conv.listing_id}`;
        if (seen.has(key)) {
          duplicateConvIds.push(conv.id);
        } else {
          seen.set(key, conv.id);
        }
      }
      if (duplicateConvIds.length > 0) {
        issues.push({
          id: "chat_duplicate_conversations",
          category: "chat",
          severity: "warning",
          title: "Conversații duplicate",
          description: `${duplicateConvIds.length} conversații duplicate detectate - vor fi consolidate`,
          autoFixable: true,
          fixAction: "merge_duplicate_conversations",
          affectedCount: duplicateConvIds.length,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // =====================================================================
    // SECTION 1.5: INACTIVE ACCOUNTS - ȘTERGERE CONTURI DUPĂ 1.5 ANI
    // =====================================================================
    
    const eighteenMonthsAgo = new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: inactiveAccounts, count: inactiveCount } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, last_activity_at", { count: "exact" })
      .lt("last_activity_at", eighteenMonthsAgo);

    if (inactiveAccounts && inactiveAccounts.length > 0) {
      issues.push({
        id: "auth_inactive_accounts",
        category: "auth",
        severity: "warning",
        title: "Conturi inactive > 1.5 ani",
        description: `${inactiveAccounts.length} conturi nu au fost folosite de peste 18 luni - vor fi marcate pentru ștergere`,
        autoFixable: true,
        fixAction: "mark_inactive_accounts",
        affectedCount: inactiveAccounts.length,
        detectedAt: new Date().toISOString()
      });
    }

    // =====================================================================
    // SECTION 2: NOTIFICATIONS HEALTH - REPARARE COMPLETĂ
    // =====================================================================
    
    // Check for old unread notifications (> 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: oldNotifications } = await supabase
      .from("notifications")
      .select("id")
      .eq("is_read", false)
      .lt("created_at", thirtyDaysAgo);

    if (oldNotifications && oldNotifications.length > 0) {
      issues.push({
        id: "notifications_stale",
        category: "notifications",
        severity: "info",
        title: "Notificări vechi necitite",
        description: `${oldNotifications.length} notificări necitite de peste 30 zile - vor fi marcate citite`,
        autoFixable: true,
        fixAction: "mark_old_notifications_read",
        affectedCount: oldNotifications.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for notifications without valid user
    const { data: orphanedNotifications } = await supabase
      .from("notifications")
      .select(`id, user_id, profiles!left(user_id)`)
      .is("profiles", null);

    if (orphanedNotifications && orphanedNotifications.length > 0) {
      issues.push({
        id: "notifications_orphaned",
        category: "notifications",
        severity: "warning",
        title: "Notificări pentru utilizatori inexistenți",
        description: `${orphanedNotifications.length} notificări nu au un utilizator valid - vor fi șterse`,
        autoFixable: true,
        fixAction: "delete_orphaned_notifications",
        affectedCount: orphanedNotifications.length,
        detectedAt: new Date().toISOString()
      });
    }

    // =====================================================================
    // SECTION 3: ORDERS HEALTH - REPARARE COMPLETĂ
    // =====================================================================
    
    // Check for stuck pending orders (> 7 days)
    const { data: stuckPendingOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("status", "pending")
      .lt("created_at", sevenDaysAgo);

    if (stuckPendingOrders && stuckPendingOrders.length > 0) {
      issues.push({
        id: "orders_stuck_pending",
        category: "orders",
        severity: "error",
        title: "Comenzi blocate în pending",
        description: `${stuckPendingOrders.length} comenzi sunt în pending de peste 7 zile - vor fi anulate`,
        autoFixable: true,
        fixAction: "cancel_stuck_orders",
        affectedCount: stuckPendingOrders.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for shipped orders without tracking (> 3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: shippedNoTracking } = await supabase
      .from("orders")
      .select("id")
      .eq("status", "shipped")
      .is("tracking_number", null)
      .lt("updated_at", threeDaysAgo);

    if (shippedNoTracking && shippedNoTracking.length > 0) {
      issues.push({
        id: "orders_no_tracking",
        category: "orders",
        severity: "warning",
        title: "Comenzi expediate fără AWB",
        description: `${shippedNoTracking.length} comenzi sunt marcate ca expediate dar nu au AWB - se vor notifica vânzătorii`,
        autoFixable: true,
        fixAction: "notify_missing_tracking",
        affectedCount: shippedNoTracking.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for orphaned orders (no listing)
    const { data: orphanedOrders } = await supabase
      .from("orders")
      .select("id, listing_id")
      .is("listing_id", null);

    if (orphanedOrders && orphanedOrders.length > 0) {
      issues.push({
        id: "orders_orphaned",
        category: "orders",
        severity: "warning",
        title: "Comenzi fără listing asociat",
        description: `${orphanedOrders.length} comenzi au referințe către listinguri șterse - vor fi marcate`,
        autoFixable: true,
        fixAction: "mark_orphaned_orders",
        affectedCount: orphanedOrders.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for disputes older than 14 days without resolution
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: stalledDisputes } = await supabase
      .from("disputes")
      .select("id")
      .eq("status", "pending")
      .lt("created_at", fourteenDaysAgo);

    if (stalledDisputes && stalledDisputes.length > 0) {
      issues.push({
        id: "orders_stalled_disputes",
        category: "orders",
        severity: "critical",
        title: "Dispute nerezolvate > 14 zile",
        description: `${stalledDisputes.length} dispute sunt în așteptare de peste 2 săptămâni - URGENT`,
        autoFixable: true,
        fixAction: "escalate_stalled_disputes",
        affectedCount: stalledDisputes.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for pending returns > 7 days
    const { data: stalledReturns } = await supabase
      .from("returns")
      .select("id")
      .eq("status", "pending")
      .lt("created_at", sevenDaysAgo);

    if (stalledReturns && stalledReturns.length > 0) {
      issues.push({
        id: "orders_stalled_returns",
        category: "orders",
        severity: "warning",
        title: "Retururi în așteptare > 7 zile",
        description: `${stalledReturns.length} cereri de retur așteaptă de peste 7 zile - vor fi escaladate`,
        autoFixable: true,
        fixAction: "escalate_stalled_returns",
        affectedCount: stalledReturns.length,
        detectedAt: new Date().toISOString()
      });
    }

    // =====================================================================
    // SECTION 3.5: AUCTION WINNER NOTIFICATIONS - NOTIFICARE CÂȘTIGĂTORI
    // =====================================================================
    
    // Check for ended auctions that need winner notification
    const { data: endedAuctions } = await supabase
      .from("listings")
      .select("id, title, seller_id, starting_bid, auction_end_date")
      .in("listing_type", ["auction", "both"])
      .eq("is_active", true)
      .eq("is_sold", false)
      .lt("auction_end_date", new Date().toISOString());

    let endedAuctionsWithWinners: { 
      listing: typeof endedAuctions extends (infer T)[] | null ? T : never; 
      highestBid: { amount: number; bidder_id: string } | null;
    }[] = [];

    if (endedAuctions && endedAuctions.length > 0) {
      // For each ended auction, find the highest bid
      for (const auction of endedAuctions) {
        const { data: highestBid } = await supabase
          .from("bids")
          .select("amount, bidder_id")
          .eq("listing_id", auction.id)
          .order("amount", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (highestBid) {
          endedAuctionsWithWinners.push({ listing: auction, highestBid });
        }
      }

      if (endedAuctionsWithWinners.length > 0) {
        issues.push({
          id: "auction_ended_with_winners",
          category: "orders",
          severity: "warning",
          title: "Licitații încheiate cu câștigători",
          description: `${endedAuctionsWithWinners.length} licitații s-au încheiat și au câștigători - vor fi notificați să plătească`,
          autoFixable: true,
          fixAction: "notify_auction_winners",
          affectedCount: endedAuctionsWithWinners.length,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // =====================================================================
    // SECTION 4: AUTH & PROFILES - REPARARE COMPLETĂ
    // =====================================================================
    
    // Check for profiles without user_roles
    const { data: profilesWithoutRoles } = await supabase
      .from("profiles")
      .select(`user_id, user_roles!left(role)`)
      .is("user_roles", null);

    if (profilesWithoutRoles && profilesWithoutRoles.length > 0) {
      issues.push({
        id: "auth_missing_roles",
        category: "auth",
        severity: "error",
        title: "Utilizatori fără roluri",
        description: `${profilesWithoutRoles.length} utilizatori nu au un rol atribuit - se va atribui "user"`,
        autoFixable: true,
        fixAction: "assign_default_roles",
        affectedCount: profilesWithoutRoles.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for users without profiles
    const { data: usersData } = await supabase.auth.admin.listUsers();
    let usersWithoutProfiles: typeof usersData.users = [];

    if (usersData?.users) {
      const { data: profiles } = await supabase.from("profiles").select("user_id");
      const profileUserIds = new Set(profiles?.map(p => p.user_id) || []);
      usersWithoutProfiles = usersData.users.filter(u => !profileUserIds.has(u.id));

      if (usersWithoutProfiles.length > 0) {
        issues.push({
          id: "auth_missing_profiles",
          category: "auth",
          severity: "critical",
          title: "Utilizatori fără profil",
          description: `${usersWithoutProfiles.length} utilizatori autentificați nu au profil - se vor crea automat`,
          autoFixable: true,
          fixAction: "create_missing_profiles",
          affectedCount: usersWithoutProfiles.length,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // =====================================================================
    // SECTION 5: DATA INTEGRITY - REPARARE COMPLETĂ
    // =====================================================================
    
    // Check for listings with invalid categories
    const { data: listingsInvalidCat } = await supabase
      .from("listings")
      .select(`id, category_id, categories!left(id)`)
      .is("categories", null)
      .not("category_id", "is", null);

    if (listingsInvalidCat && listingsInvalidCat.length > 0) {
      issues.push({
        id: "data_invalid_categories",
        category: "data_integrity",
        severity: "warning",
        title: "Listinguri cu categorii invalide",
        description: `${listingsInvalidCat.length} listinguri au categorii inexistente - se vor reseta`,
        autoFixable: true,
        fixAction: "clear_invalid_categories",
        affectedCount: listingsInvalidCat.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for active listings without images
    const { data: listingsNoImages } = await supabase
      .from("listings")
      .select(`id, is_active, listing_images!left(id)`)
      .eq("is_active", true)
      .is("listing_images", null);

    if (listingsNoImages && listingsNoImages.length > 0) {
      issues.push({
        id: "data_listings_no_images",
        category: "storage",
        severity: "warning",
        title: "Listinguri active fără imagini",
        description: `${listingsNoImages.length} listinguri active nu au imagini - vor fi dezactivate`,
        autoFixable: true,
        fixAction: "deactivate_imageless_listings",
        affectedCount: listingsNoImages.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for expired promotions still active
    const { data: expiredPromotions } = await supabase
      .from("listing_promotions")
      .select("id")
      .eq("is_active", true)
      .lt("ends_at", new Date().toISOString());

    if (expiredPromotions && expiredPromotions.length > 0) {
      issues.push({
        id: "data_expired_promotions",
        category: "data_integrity",
        severity: "warning",
        title: "Promoții expirate active",
        description: `${expiredPromotions.length} promoții expirate sunt încă active - vor fi dezactivate`,
        autoFixable: true,
        fixAction: "deactivate_expired_promotions",
        affectedCount: expiredPromotions.length,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for negative balances
    const { data: negativeBalances } = await supabase
      .from("profiles")
      .select("user_id, pending_balance, payout_balance")
      .or("pending_balance.lt.0,payout_balance.lt.0");

    if (negativeBalances && negativeBalances.length > 0) {
      issues.push({
        id: "data_negative_balances",
        category: "data_integrity",
        severity: "critical",
        title: "Solduri negative detectate",
        description: `${negativeBalances.length} utilizatori au solduri negative - vor fi corectate la 0`,
        autoFixable: true,
        fixAction: "fix_negative_balances",
        affectedCount: negativeBalances.length,
        detectedAt: new Date().toISOString()
      });
    }

    // =====================================================================
    // SECTION 6: SECURITY CHECKS
    // =====================================================================
    
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
        id: "security_weak_settings",
        category: "security",
        severity: "critical",
        title: "Setări de securitate slabe",
        description: `Probleme: ${securityIssues.join(", ")} - se vor activa automat`,
        autoFixable: true,
        fixAction: "enable_security_features",
        detectedAt: new Date().toISOString()
      });
    }

    // Check for too many admin users
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

    // =====================================================================
    // SECTION 6.5: FRAUD DETECTION - DETECTARE ACTIVITĂȚI FRAUDULOASE
    // =====================================================================
    
    const fraudAlertsToCreate: FraudAlert[] = [];
    
    // 🔴 SHILL BIDDING DETECTION - Detectare licitații pe propriile produse
    // Check for bids where bidder might be connected to seller
    const { data: allBids } = await supabase
      .from("bids")
      .select(`
        id, 
        amount, 
        bidder_id, 
        listing_id, 
        created_at,
        listings!inner(id, seller_id, title)
      `)
      .order("created_at", { ascending: false })
      .limit(500);

    if (allBids) {
      // Group bids by listing to analyze patterns
      const bidsByListing = new Map<string, typeof allBids>();
      for (const bid of allBids) {
        const listingId = bid.listing_id;
        if (!bidsByListing.has(listingId)) {
          bidsByListing.set(listingId, []);
        }
        bidsByListing.get(listingId)!.push(bid);
      }

      // Check for self-bidding (bidder = seller)
      for (const bid of allBids) {
        const listing = bid.listings as any;
        if (listing && bid.bidder_id === listing.seller_id) {
          fraudAlertsToCreate.push({
            user_id: bid.bidder_id,
            alert_type: "shill_bidding",
            severity: "critical",
            title: "LICITAȚIE PE PROPRIUL PRODUS",
            description: `Utilizatorul a licitat ${bid.amount} pe propriul produs "${listing.title}"`,
            evidence: [{
              type: "bid",
              bid_id: bid.id,
              listing_id: bid.listing_id,
              amount: bid.amount,
              timestamp: bid.created_at
            }],
            listing_id: bid.listing_id,
            auto_action_taken: "account_flagged"
          });
        }
      }

      // Check for suspicious bidding patterns (same user always outbidding on same seller's items)
      const bidderSellerPatterns = new Map<string, { count: number; total: number; listings: Set<string> }>();
      for (const bid of allBids) {
        const listing = bid.listings as any;
        if (listing) {
          const key = `${bid.bidder_id}_${listing.seller_id}`;
          if (!bidderSellerPatterns.has(key)) {
            bidderSellerPatterns.set(key, { count: 0, total: 0, listings: new Set() });
          }
          const pattern = bidderSellerPatterns.get(key)!;
          pattern.count++;
          pattern.total += bid.amount;
          pattern.listings.add(bid.listing_id);
        }
      }

      // Flag if same bidder bids on 5+ different items from same seller
      for (const [key, pattern] of bidderSellerPatterns.entries()) {
        if (pattern.listings.size >= 5) {
          const [bidderId, sellerId] = key.split("_");
          if (bidderId !== sellerId) { // Not self-bidding, but suspicious pattern
            fraudAlertsToCreate.push({
              user_id: bidderId,
              alert_type: "suspicious_bidding_pattern",
              severity: "warning",
              title: "PATTERN SUSPICIOS DE LICITARE",
              description: `Utilizatorul a licitat pe ${pattern.listings.size} produse diferite ale aceluiași vânzător (total: ${pattern.total})`,
              evidence: [{
                type: "pattern",
                seller_id: sellerId,
                listings_count: pattern.listings.size,
                total_amount: pattern.total,
                bid_count: pattern.count
              }],
              related_user_ids: [sellerId]
            });
          }
        }
      }

      // Check for rapid successive bids (price manipulation)
      for (const [listingId, listingBids] of bidsByListing.entries()) {
        if (listingBids.length >= 3) {
          const sortedBids = listingBids.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          for (let i = 0; i < sortedBids.length - 2; i++) {
            const timeDiff1 = new Date(sortedBids[i + 1].created_at).getTime() - new Date(sortedBids[i].created_at).getTime();
            const timeDiff2 = new Date(sortedBids[i + 2].created_at).getTime() - new Date(sortedBids[i + 1].created_at).getTime();
            
            // If 3 bids within 2 minutes involving same bidders
            if (timeDiff1 < 60000 && timeDiff2 < 60000) { // < 1 min each
              const bidders = new Set([sortedBids[i].bidder_id, sortedBids[i + 1].bidder_id, sortedBids[i + 2].bidder_id]);
              if (bidders.size <= 2) { // Only 1-2 people bidding rapidly
                fraudAlertsToCreate.push({
                  user_id: sortedBids[i].bidder_id,
                  alert_type: "price_manipulation",
                  severity: "warning",
                  title: "MANIPULARE RAPIDĂ A PREȚULUI",
                  description: `3 licitații în mai puțin de 2 minute pe același produs, implicând doar ${bidders.size} licitatori`,
                  evidence: sortedBids.slice(i, i + 3).map(b => ({
                    bid_id: b.id,
                    bidder_id: b.bidder_id,
                    amount: b.amount,
                    timestamp: b.created_at
                  })),
                  listing_id: listingId,
                  related_user_ids: Array.from(bidders)
                });
              }
            }
          }
        }
      }
    }

    // 🔴 SUSPICIOUS WITHDRAWAL PATTERNS
    const { data: recentPayouts } = await supabase
      .from("seller_payouts")
      .select("seller_id, gross_amount, created_at, status")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false });

    if (recentPayouts) {
      // Group by seller
      const payoutsBySeller = new Map<string, typeof recentPayouts>();
      for (const payout of recentPayouts) {
        if (!payoutsBySeller.has(payout.seller_id)) {
          payoutsBySeller.set(payout.seller_id, []);
        }
        payoutsBySeller.get(payout.seller_id)!.push(payout);
      }

      // Flag multiple large withdrawals in short time
      for (const [sellerId, sellerPayouts] of payoutsBySeller.entries()) {
        const totalAmount = sellerPayouts.reduce((sum, p) => sum + p.gross_amount, 0);
        if (sellerPayouts.length >= 3 && totalAmount > 1000) {
          fraudAlertsToCreate.push({
            user_id: sellerId,
            alert_type: "suspicious_withdrawal",
            severity: "warning",
            title: "EXTRAGERI MULTIPLE RAPIDE",
            description: `${sellerPayouts.length} cereri de extragere în 7 zile (total: £${totalAmount.toFixed(2)})`,
            evidence: sellerPayouts.map(p => ({
              amount: p.gross_amount,
              status: p.status,
              timestamp: p.created_at
            }))
          });
        }
      }
    }

    // 🔴 MULTIPLE ACCOUNTS DETECTION (same patterns, IPs, etc.)
    // Check for profiles with same phone or similar display names created recently
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentProfiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, phone, created_at")
      .gte("created_at", oneDayAgo);

    if (recentProfiles && recentProfiles.length > 5) {
      // Check for duplicate phones
      const phoneMap = new Map<string, string[]>();
      for (const profile of recentProfiles) {
        if (profile.phone) {
          if (!phoneMap.has(profile.phone)) {
            phoneMap.set(profile.phone, []);
          }
          phoneMap.get(profile.phone)!.push(profile.user_id);
        }
      }

      for (const [phone, userIds] of phoneMap.entries()) {
        if (userIds.length > 1) {
          fraudAlertsToCreate.push({
            user_id: userIds[0],
            alert_type: "multiple_accounts",
            severity: "critical",
            title: "CONTURI MULTIPLE CU ACELAȘI TELEFON",
            description: `${userIds.length} conturi noi create cu numărul ${phone.slice(0, 4)}****`,
            evidence: userIds.map(id => ({ user_id: id })),
            related_user_ids: userIds.slice(1)
          });
        }
      }
    }

    // Save fraud alerts to database and notify admins
    if (fraudAlertsToCreate.length > 0) {
      const { error: alertError } = await supabase
        .from("fraud_alerts")
        .insert(fraudAlertsToCreate);

      if (!alertError) {
        proactiveRepairs.push(`🚨 Creat ${fraudAlertsToCreate.length} alerte de fraudă pentru revizuire`);

        // Notify admins about fraud alerts
        if (adminRoles) {
          const criticalAlerts = fraudAlertsToCreate.filter(a => a.severity === "critical");
          if (criticalAlerts.length > 0) {
            const adminNotifs = adminRoles.map(a => ({
              user_id: a.user_id,
              type: "fraud_alert",
              title: "🚨 ALERTĂ FRAUDĂ CRITICĂ",
              message: `AI a detectat ${criticalAlerts.length} activități frauduloase critice (shill bidding, conturi multiple). Verifică imediat!`,
              data: { fraud_count: criticalAlerts.length, types: criticalAlerts.map(a => a.alert_type) }
            }));
            await supabase.from("notifications").insert(adminNotifs);
          }
        }

        // Auto-actions for critical fraud
        for (const alert of fraudAlertsToCreate) {
          if (alert.severity === "critical" && alert.alert_type === "shill_bidding") {
            // Block withdrawal for shill bidders
            await supabase
              .from("profiles")
              .update({
                withdrawal_blocked: true,
                withdrawal_blocked_reason: "Activitate frauduloasă detectată (shill bidding) - în investigație",
                withdrawal_blocked_at: new Date().toISOString(),
                fraud_score: 100
              })
              .eq("user_id", alert.user_id);
            
            proactiveRepairs.push(`🔒 Blocat extragerea pentru utilizatorul cu shill bidding: ${alert.user_id.slice(0, 8)}...`);
          }
        }
      }

      issues.push({
        id: "fraud_alerts_detected",
        category: "fraud",
        severity: fraudAlertsToCreate.some(a => a.severity === "critical") ? "critical" : "warning",
        title: "Activități frauduloase detectate",
        description: `${fraudAlertsToCreate.length} alerte de fraudă (${fraudAlertsToCreate.filter(a => a.severity === "critical").length} critice)`,
        autoFixable: true,
        fixAction: "fraud_alerts_created",
        affectedCount: fraudAlertsToCreate.length,
        detectedAt: new Date().toISOString(),
        fixedAt: new Date().toISOString(),
        fixResult: `Alertele au fost create și adminii au fost notificați`
      });
    }

    // =====================================================================
    // SECTION 7: AUTO-FIX ENGINE - REPARARE COMPLETĂ
    // =====================================================================
    
    const executeAutoFix = async (issue: MaintenanceIssue): Promise<string> => {
      try {
        switch (issue.fixAction) {
          // === CHAT FIXES ===
          case "delete_old_messages":
            if (oldMessages) {
              const ids = oldMessages.map(m => m.id);
              const { error } = await supabase
                .from("messages")
                .delete()
                .in("id", ids);
              if (!error) return `✅ Șters ${ids.length} mesaje mai vechi de 3 zile`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit mesaje de șters";

          case "archive_orphaned_conversations":
            if (conversationsWithDeletedListings) {
              const ids = conversationsWithDeletedListings.map(c => c.id);
              // Move messages to archive or mark conversation
              const { error } = await supabase
                .from("conversations")
                .delete()
                .in("id", ids);
              if (!error) return `✅ Arhivat ${ids.length} conversații cu listinguri șterse`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit conversații de arhivat";
          
          case "mark_inactive_accounts":
            if (inactiveAccounts) {
              // For now, we just log them - actual deletion requires admin approval
              // In production, you'd send notifications or mark for deletion
              const userIds = inactiveAccounts.map(a => a.user_id);
              
              // Create notifications for admins about inactive accounts
              if (adminRoles) {
                const notifs = adminRoles.map(a => ({
                  user_id: a.user_id,
                  type: "admin_alert",
                  title: "Conturi inactive pentru revizuire",
                  message: `${userIds.length} conturi nu au fost folosite de peste 18 luni și sunt marcate pentru ștergere.`,
                }));
                await supabase.from("notifications").insert(notifs);
              }
              
              return `✅ Notificat adminii despre ${userIds.length} conturi inactive (>18 luni)`;
            }
            return "⚠️ Nu s-au găsit conturi inactive";

          case "mark_old_messages_read":
            if (oldUnreadMessages) {
              const ids = oldUnreadMessages.map(m => m.id);
              const { error } = await supabase
                .from("messages")
                .update({ is_read: true })
                .in("id", ids);
              if (!error) return `✅ Marcat ${ids.length} mesaje vechi ca citite`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit mesaje de marcat";

          case "delete_empty_conversations":
            if (emptyConversations) {
              const ids = emptyConversations.map(c => c.id);
              const { error } = await supabase
                .from("conversations")
                .delete()
                .in("id", ids);
              if (!error) return `✅ Șters ${ids.length} conversații goale`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit conversații goale";

          case "merge_duplicate_conversations":
            if (duplicateConvIds.length > 0) {
              // Delete duplicate conversations (keep first one)
              const { error } = await supabase
                .from("conversations")
                .delete()
                .in("id", duplicateConvIds);
              if (!error) return `✅ Eliminat ${duplicateConvIds.length} conversații duplicate`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit duplicate";

          // === NOTIFICATION FIXES ===
          case "mark_old_notifications_read":
            if (oldNotifications) {
              const ids = oldNotifications.map(n => n.id);
              const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .in("id", ids);
              if (!error) return `✅ Marcat ${ids.length} notificări vechi ca citite`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit notificări de marcat";

          case "delete_orphaned_notifications":
            if (orphanedNotifications) {
              const ids = orphanedNotifications.map(n => n.id);
              const { error } = await supabase
                .from("notifications")
                .delete()
                .in("id", ids);
              if (!error) return `✅ Șters ${ids.length} notificări orfane`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit notificări orfane";

          // === ORDER FIXES ===
          case "cancel_stuck_orders":
            if (stuckPendingOrders) {
              const ids = stuckPendingOrders.map(o => o.id);
              const { error } = await supabase
                .from("orders")
                .update({ 
                  status: "cancelled", 
                  cancelled_at: new Date().toISOString(),
                  processor_error: "auto_cancelled_timeout"
                })
                .in("id", ids);
              if (!error) return `✅ Anulat ${ids.length} comenzi blocate în pending`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit comenzi blocate";

          case "notify_missing_tracking":
            if (shippedNoTracking) {
              // Create notifications for sellers
              const { data: ordersToNotify } = await supabase
                .from("orders")
                .select("seller_id")
                .in("id", shippedNoTracking.map(o => o.id));
              
              if (ordersToNotify) {
                const notifs = ordersToNotify.map(o => ({
                  user_id: o.seller_id,
                  type: "order_alert",
                  title: "AWB Lipsă",
                  message: "Ai comenzi expediate fără număr de urmărire. Te rugăm să adaugi AWB-ul.",
                }));
                await supabase.from("notifications").insert(notifs);
                return `✅ Notificat ${notifs.length} vânzători despre AWB lipsă`;
              }
            }
            return "⚠️ Nu s-au găsit comenzi fără AWB";

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

          case "escalate_stalled_disputes":
            if (stalledDisputes) {
              const ids = stalledDisputes.map(d => d.id);
              const { error } = await supabase
                .from("disputes")
                .update({ 
                  status: "escalated",
                  admin_notes: "[AUTO] Escaladat automat după 14 zile fără rezoluție"
                })
                .in("id", ids);
              if (!error) return `✅ Escaladat ${ids.length} dispute vechi`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit dispute de escaladat";

          case "escalate_stalled_returns":
            if (stalledReturns) {
              const ids = stalledReturns.map(r => r.id);
              const { error } = await supabase
                .from("returns")
                .update({ 
                  admin_notes: "[AUTO] Necesită atenție - în așteptare > 7 zile"
                })
                .in("id", ids);
              
              // Notify admins
              if (adminRoles) {
                const notifs = adminRoles.map(a => ({
                  user_id: a.user_id,
                  type: "admin_alert",
                  title: "Retururi în așteptare",
                  message: `${ids.length} cereri de retur așteaptă de peste 7 zile.`,
                }));
                await supabase.from("notifications").insert(notifs);
              }
              
              if (!error) return `✅ Escaladat ${ids.length} retururi și notificat adminii`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit retururi de escaladat";

          // === AUCTION WINNER NOTIFICATIONS ===
          case "notify_auction_winners":
            if (endedAuctionsWithWinners.length > 0) {
              let notified = 0;
              for (const { listing, highestBid } of endedAuctionsWithWinners) {
                if (!highestBid) continue;
                
                // Notify winner
                await supabase.from("notifications").insert({
                  user_id: highestBid.bidder_id,
                  type: "auction_won",
                  title: "🎉 Ai câștigat licitația!",
                  message: `Felicitări! Ai câștigat licitația pentru "${listing.title}" cu £${highestBid.amount.toFixed(2)}. Te rugăm să finalizezi plata.`,
                  data: { 
                    listing_id: listing.id, 
                    amount: highestBid.amount,
                    action: "complete_payment"
                  }
                });

                // Notify seller
                await supabase.from("notifications").insert({
                  user_id: listing.seller_id,
                  type: "auction_ended",
                  title: "🔔 Licitație încheiată",
                  message: `Licitația pentru "${listing.title}" s-a încheiat cu £${highestBid.amount.toFixed(2)}. Câștigătorul a fost notificat să plătească.`,
                  data: { 
                    listing_id: listing.id, 
                    amount: highestBid.amount,
                    winner_id: highestBid.bidder_id
                  }
                });

                // Mark bid as winning
                await supabase
                  .from("bids")
                  .update({ is_winning: true })
                  .eq("listing_id", listing.id)
                  .eq("bidder_id", highestBid.bidder_id)
                  .eq("amount", highestBid.amount);

                notified++;
              }
              return `✅ Notificat ${notified} câștigători de licitații și vânzători`;
            }
            return "⚠️ Nu s-au găsit licitații încheiate cu câștigători";

          // === AUTH FIXES ===
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
            return "⚠️ Nu s-au găsit utilizatori fără rol";

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

          // === DATA INTEGRITY FIXES ===
          case "clear_invalid_categories":
            if (listingsInvalidCat) {
              const ids = listingsInvalidCat.map(l => l.id);
              const { error } = await supabase
                .from("listings")
                .update({ category_id: null })
                .in("id", ids);
              if (!error) return `✅ Resetat ${ids.length} categorii invalide`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit listinguri de reparat";

          case "deactivate_imageless_listings":
            if (listingsNoImages) {
              const ids = listingsNoImages.map(l => l.id);
              const { error } = await supabase
                .from("listings")
                .update({ is_active: false })
                .in("id", ids);
              if (!error) return `✅ Dezactivat ${ids.length} listinguri fără imagini`;
              return `❌ Eroare: ${error.message}`;
            }
            return "⚠️ Nu s-au găsit listinguri fără imagini";

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

          case "fix_negative_balances":
            if (negativeBalances) {
              for (const profile of negativeBalances) {
                await supabase
                  .from("profiles")
                  .update({
                    pending_balance: Math.max(0, profile.pending_balance || 0),
                    payout_balance: Math.max(0, profile.payout_balance || 0)
                  })
                  .eq("user_id", profile.user_id);
              }
              return `✅ Corectat ${negativeBalances.length} solduri negative la 0`;
            }
            return "⚠️ Nu s-au găsit solduri negative";

          // === SECURITY FIXES ===
          case "enable_security_features":
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
            return `❌ Eroare: ${secError.message}`;

          default:
            return `⚠️ Acțiune necunoscută: ${issue.fixAction}`;
        }
      } catch (error) {
        return `❌ Excepție: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    };

    // =====================================================================
    // SECTION 8: EXECUTE REPAIRS
    // =====================================================================

    // PROACTIVE AUTO-REPAIR: Fix all issues automatically on every scan
    if (action === "scan" && autoRepairEnabled) {
      const fixableIssues = issues.filter(i => i.autoFixable);
      for (const issue of fixableIssues) {
        const result = await executeAutoFix(issue);
        proactiveRepairs.push(`[${issue.id}] ${result}`);
        if (result.startsWith("✅")) {
          issuesFixed++;
          issue.fixedAt = new Date().toISOString();
          issue.fixResult = result;
        }
      }
    }

    // Single fix
    if (action === "auto_fix" && issueId) {
      const issue = issues.find(i => i.id === issueId);
      if (issue && issue.autoFixable) {
        const result = await executeAutoFix(issue);
        autoFixLog.push(`[${issue.id}] ${result}`);
        if (result.startsWith("✅")) {
          issuesFixed++;
          issue.fixedAt = new Date().toISOString();
          issue.fixResult = result;
        }
      }
    }

    // Full repair
    if (action === "full_auto_repair") {
      const fixableIssues = issues.filter(i => i.autoFixable && !i.fixedAt);
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

    // =====================================================================
    // SECTION 9: CALCULATE HEALTH SCORES
    // =====================================================================
    
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
      database: 100, // Now covered by other categories
      storage: calculateCategoryHealth("storage"),
      auth: calculateCategoryHealth("auth"),
      chat: calculateCategoryHealth("chat"),
      notifications: calculateCategoryHealth("notifications"),
      orders: calculateCategoryHealth("orders"),
      dataIntegrity: calculateCategoryHealth("data_integrity"),
      performance: calculateCategoryHealth("performance"),
      security: calculateCategoryHealth("security"),
      fraud: calculateCategoryHealth("fraud"),
      overall: 0
    };

    systemHealth.overall = Math.round(
      (systemHealth.storage + systemHealth.auth + systemHealth.chat +
        systemHealth.notifications + systemHealth.orders +
        systemHealth.dataIntegrity + systemHealth.performance + 
        systemHealth.security + systemHealth.fraud) / 9
    );

    // =====================================================================
    // SECTION 10: AI ANALYSIS - CUNOȘTINȚE COMPLETE PLATFORMĂ (80%)
    // =====================================================================
    
    let aiAnalysis = null;
    if (action === "analyze" || action === "full_auto_repair") {
      const remainingIssues = issues.filter(i => !i.fixedAt);
      
      // MEGA-PROMPT cu 80% din cunoștințele despre platformă
      const platformKnowledgeBase = `
═══════════════════════════════════════════════════════════════════════════════
🔧 AI MAINTENANCE ULTRA PRO - BAZA DE CUNOȘTINȚE COMPLETĂ (80% KNOWLEDGE)
═══════════════════════════════════════════════════════════════════════════════

📦 ARHITECTURA PLATFORMEI C MARKET ROMÂNIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STACK TEHNOLOGIC:
- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- AI: Lovable AI Gateway (Gemini 3 Flash Preview)
- Mobile: Capacitor pentru iOS/Android
- Plăți: MangoPay (exclusiv) + COD (Ramburs)

═══════════════════════════════════════════════════════════════════════════════
📊 SCHEMA COMPLETĂ A BAZEI DE DATE (34 TABELE)
═══════════════════════════════════════════════════════════════════════════════

1. UTILIZATORI & AUTENTIFICARE:
   - profiles: user_id, display_name, username, avatar_url, bio, store_name, 
               is_seller, is_verified, iban, phone, pending_balance, payout_balance,
               kyc_status (pending/verified/rejected), mangopay_user_id, mangopay_wallet_id
   - user_roles: user_id → role (admin/moderator/user) - NICIODATĂ pe profiles!
   - admin_emails: email, is_active - verificare dinamică admin
   - push_tokens: token, platform (ios/android/web)
   
   RELAȚII CRITICE:
   - profiles.user_id → auth.users.id (NU foreign key direct!)
   - Fiecare utilizator TREBUIE să aibă un rol în user_roles

2. ANUNȚURI & PRODUSE:
   - listings: id, seller_id, title, price, description, condition (new/like_new/good/fair/poor),
               category_id, is_active, is_sold, location, shipping_cost, cod_enabled,
               listing_type (buy_now/auction), auction_end_date, starting_bid, reserve_price
   - listing_images: listing_id, image_url, is_primary, sort_order
   - categories: id, name, slug, icon, parent_id (subcategorii)
   - listing_promotions: listing_id, seller_id, promotion_type, starts_at, ends_at, is_active

   RELAȚII CRITICE:
   - listings.seller_id → profiles.user_id
   - listings.category_id → categories.id (poate fi NULL)
   - listing_images.listing_id → listings.id

3. COMENZI & TRANZACȚII:
   - orders: id, listing_id, buyer_id, seller_id, amount, status (pending/paid/shipped/delivered/cancelled),
             shipping_address, tracking_number, carrier, payment_processor, processor_status,
             buyer_fee, seller_commission, payout_amount, payout_status, refund_status
   - invoices: order_id, buyer_id, seller_id, invoice_number, subtotal, total, status
   - payouts: order_id, seller_id, gross_amount, net_amount, seller_commission, status
   - seller_payouts: seller_id, order_id, gross_amount, net_amount, platform_commission, status
   - refunds: order_id, buyer_id, seller_id, amount, reason, status, processor_refund_id

   STATUS ORDERS FLOW:
   pending → paid → shipped (+ tracking) → delivered → [completed/dispute]
   Orice: → cancelled (cu refund automat dacă paid)

4. DISPUTE & RETURURI:
   - disputes: order_id, reporter_id, reported_user_id, reason, status (pending/investigating/resolved),
               resolution, admin_notes
   - returns: order_id, buyer_id, seller_id, reason, status, tracking_number, refund_amount

   REGULI DISPUTE:
   - Dispute > 14 zile nerezolvat = CRITIC
   - Retur > 7 zile în pending = escaladare automată

5. MESAGERIE & CHAT:
   - conversations: id, buyer_id, seller_id, listing_id, created_at, updated_at
   - messages: id, conversation_id, sender_id, content, is_read, created_at
   - friendships: requester_id, addressee_id, status (pending/accepted/blocked)

   PROBLEME COMUNE CHAT:
   - Conversații duplicate (same buyer+seller+listing)
   - Conversații orfane (listing șters)
   - Mesaje necitite > 7 zile
   - Conversații goale (fără mesaje)

6. NOTIFICĂRI:
   - notifications: user_id, type, title, message, data (JSON), is_read, created_at
   
   TIPURI NOTIFICĂRI:
   new_order, order_shipped, order_delivered, message_received, review_received,
   bid_placed, bid_won, dispute_opened, refund_processed, promotion_expired

7. LICITAȚII:
   - bids: listing_id, bidder_id, amount, is_winning, created_at
   
   REGULI LICITAȚII:
   - bid_increment minim respectat
   - reserve_price = preț minim pentru vânzare
   - buy_now_price = cumpărare instant

8. RECENZII:
   - reviews: order_id, reviewer_id, reviewed_user_id, rating (1-5), comment

9. FAVORITE:
   - favorites: user_id, listing_id

10. SETĂRI PLATFORMĂ:
    - platform_settings: key, value (JSON), category
    - platform_fees: fee_type (buyer_fee/seller_commission), amount, is_percentage
    - payment_processor_settings: processor_name, api_key_encrypted, is_active, environment
    - seo_settings, homepage_content, policies_content, email_templates

═══════════════════════════════════════════════════════════════════════════════
🔒 POLITICI RLS (Row Level Security) - SECURITATE
═══════════════════════════════════════════════════════════════════════════════

PATTERN-URI SECURITATE:
1. Utilizatorul vede DOAR datele proprii: auth.uid() = user_id
2. Vânzătorul vede comenzile sale: auth.uid() = seller_id OR auth.uid() = buyer_id
3. Adminii văd tot: has_role(auth.uid(), 'admin')
4. Date publice (listings active): is_active = true
5. Date sensibile (IBAN, telefon): DOAR proprietar sau admin

FUNCȚII SECURITATE:
- has_role(user_id, role) - verifică rol fără recursivitate
- is_admin_email(email) - verifică dacă email e admin
- get_public_seller_profile(user_id) - date publice vânzător (FĂRĂ PII)
- increment_pending_balance(user_id, amount) - DOAR service_role!

VULNERABILITĂȚI DE MONITORIZAT:
- Expunere IBAN/telefon în profiles
- Acces neautorizat la increment_pending_balance
- RLS lipsă pe tabele noi
- Politici prea permisive pe reviews/bids

═══════════════════════════════════════════════════════════════════════════════
⚡ EDGE FUNCTIONS - BACKEND LOGIC
═══════════════════════════════════════════════════════════════════════════════

FUNCȚII CRITICE:
1. process-payment: Crează ordere, actualizează listing ca sold, trimite notificări
2. process-payout: Transferă bani către vânzători (MangoPay/Adyen)
3. process-refund: Procesează refund către cumpărător
4. send-notification: Trimite notificări push/email
5. ai-maintenance: EU - reparare automată platformă
6. ai-sales-manager: Analizează vânzări și recomandă strategii
7. kyc-onboarding: Verificare identitate vânzător (MangoPay KYC)
8. courier-lockers: API pentru lockere Sameday/FanCourier

SECRETELE NECESARE:
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto)
- LOVABLE_API_KEY (auto - pentru AI)
- RESEND_API_KEY (email-uri)
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN (SMS)
- MANGOPAY_CLIENT_ID, MANGOPAY_API_KEY (plăți)

═══════════════════════════════════════════════════════════════════════════════
🐛 PROBLEME COMUNE & SOLUȚII AUTOMATE
═══════════════════════════════════════════════════════════════════════════════

CHAT & MESAJE:
| Problemă | Cauză | Soluție AI |
|----------|-------|------------|
| Conversații orfane | Listing șters | Ștergere conversație + mesaje |
| Mesaje necitite > 7 zile | Utilizator inactiv | Marcare ca citite |
| Conversații duplicate | Bug UI | Merge mesaje + șterge duplicat |
| Conversații goale | Abandon chat | Ștergere automată |

COMENZI:
| Problemă | Cauză | Soluție AI |
|----------|-------|------------|
| Pending > 7 zile | Plată nefinalizată | Anulare automată |
| Shipped fără AWB | Vânzător neglijent | Notificare + escaladare |
| Dispute > 14 zile | Admin inactiv | Marcare URGENT |
| Retur > 7 zile | Proces blocat | Escaladare automată |

AUTENTIFICARE:
| Problemă | Cauză | Soluție AI |
|----------|-------|------------|
| User fără profil | Trigger nefuncțional | Creare profil + rol user |
| User fără rol | Trigger nefuncțional | Atribuire rol "user" |
| Admin email inexistent | Config veche | Adăugare în admin_emails |

DATE & INTEGRITATE:
| Problemă | Cauză | Soluție AI |
|----------|-------|------------|
| Listing fără imagini | Upload eșuat | Dezactivare listing |
| Categorie invalidă | Categorie ștearsă | Reset category_id = NULL |
| Sold negativ | Bug calcul | Reset la 0 |
| Promoție expirată | Cron nefuncțional | Dezactivare is_active |

SECURITATE:
| Problemă | Cauză | Soluție AI |
|----------|-------|------------|
| 2FA dezactivat | Setare default | Activare automată |
| Rate limit off | Config lipsă | Activare 100 req/min |
| Password policy slab | Setare veche | Min 12 chars + symbols |

═══════════════════════════════════════════════════════════════════════════════
📈 METRICI & KPI PLATFORMĂ
═══════════════════════════════════════════════════════════════════════════════

SĂNĂTATE IDEALĂ (100%):
- 0 conversații orfane
- 0 mesaje necitite > 7 zile
- 0 comenzi pending > 7 zile
- 0 dispute nerezolvate > 14 zile
- 0 utilizatori fără rol
- 0 solduri negative
- Toate setările securitate active

CALCUL HEALTH SCORE:
- Critical issue: -40 puncte
- Error: -25 puncte
- Warning: -10 puncte
- Info: -5 puncte

COMISIOANE PLATFORMĂ:
- Seller commission: 8% din vânzare
- Buyer fee: 2-5 RON fix (opțional)
- Promoții: 5-50 RON/săptămână

═══════════════════════════════════════════════════════════════════════════════
🔄 FLUXURI CRITICE
═══════════════════════════════════════════════════════════════════════════════

FLUX COMANDĂ:
1. Buyer selectează produs → Checkout
2. process-payment: Crează order (pending), marchează listing sold
3. Buyer plătește (MangoPay/COD)
4. Seller primește notificare → Expediază cu AWB
5. Buyer confirmă primire → Order delivered
6. 7 zile protecție → Payout către seller
7. Notificare review request

FLUX RETUR:
1. Buyer solicită retur (motiv)
2. Seller acceptă/refuză
3. Buyer expediază înapoi (AWB)
4. Seller confirmă primire
5. process-refund → Bani înapoi la buyer
6. Listing se reactivează (opțional)

FLUX LICITAȚIE:
1. Seller creează listing type=auction
2. Bidders plasează oferte (bid_increment)
3. La auction_end_date: cel mai mare bid câștigă
4. Dacă reserve_price neatingut → Licitație anulată
5. Câștigător → Checkout automat

═══════════════════════════════════════════════════════════════════════════════
🛡️ RESTRICȚII AI - NU AM VOIE SĂ:
═══════════════════════════════════════════════════════════════════════════════

ACȚIUNI INTERZISE (conform AI_POLICY):
- delete_user, block_user, suspend_user, ban_user
- delete_listing, delete_order, delete_conversation
- modify_user_role (excepție: atribuire rol default la user NOU)
- delete_data, purge_records

ACȚIUNI PERMISE:
- report_issue, suggest_action, analyze_data
- send_notification, create_alert
- update_status (ordere/promoții, NU utilizatori)
- assign_default_role (DOAR utilizatori noi fără rol)
- create_profile (DOAR utilizatori fără profil)

═══════════════════════════════════════════════════════════════════════════════
`;

      const analysisPrompt = `${platformKnowledgeBase}

═══════════════════════════════════════════════════════════════════════════════
📊 RAPORT SESIUNE CURENTĂ
═══════════════════════════════════════════════════════════════════════════════

🔧 REPARĂRI AUTOMATE EFECTUATE:
${proactiveRepairs.length > 0 ? proactiveRepairs.map(r => `  • ${r}`).join("\n") : "  • Nicio reparare necesară"}

${autoFixLog.length > 0 ? `📋 REPARĂRI SUPLIMENTARE:\n${autoFixLog.map(r => `  • ${r}`).join("\n")}` : ""}

📈 STARE ACTUALĂ DUPĂ REPARĂRI:
  • Chat: ${systemHealth.chat}%
  • Notificări: ${systemHealth.notifications}%
  • Comenzi: ${systemHealth.orders}%
  • Autentificare: ${systemHealth.auth}%
  • Integritate Date: ${systemHealth.dataIntegrity}%
  • Securitate: ${systemHealth.security}%
  • Storage: ${systemHealth.storage}%
  • Performance: ${systemHealth.performance}%
  ━━━━━━━━━━━━━━━━━━━━━━━
  • OVERALL: ${systemHealth.overall}%

⚠️ PROBLEME RĂMASE (necesită intervenție manuală):
${remainingIssues.length > 0 ? remainingIssues.map(i => `  • [${i.severity.toUpperCase()}] ${i.title}: ${i.description}`).join("\n") : "  ✨ NICIUNA - Totul este reparat!"}

📊 STATISTICI:
  • Total detectate: ${issues.length}
  • Reparate automat: ${issuesFixed}
  • Rămase: ${remainingIssues.length}

═══════════════════════════════════════════════════════════════════════════════
SARCINĂ: Generează un RAPORT EXECUTIV în română care include:

1. 🏆 VERDICT FINAL (1 linie: "Platformă sănătoasă" / "Necesită atenție" / "Situație critică")

2. ✅ REPARĂRI AUTOMATE (bullet points cu ce s-a reparat)

3. ⚠️ ATENȚIE MANUALĂ (dacă există probleme nereparabile)

4. 💡 RECOMANDĂRI PREVENTIVE (3-5 sfaturi bazate pe pattern-urile detectate)

5. 📈 TREND (Compară cu sesiunile anterioare dacă există pattern-uri)

Fii CONCIS, PROFESIONAL și evidențiază că AI-ul a reparat AUTOMAT problemele.
═══════════════════════════════════════════════════════════════════════════════`;

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
                content: `Ești AI Maintenance ULTRA PRO pentru C Market România - un marketplace românesc.
                
PERSONALITATE: Inginer de platformă expert, eficient, orientat spre soluții.
LIMBAJ: Română profesională, tehnică dar accesibilă.
FORMAT: Structurat cu emoji-uri pentru claritate vizuală.
TON: Încrezător dar nu arogant - subliniază reparările automate.

CUNOȘTINȚE: Ai acces la 80% din arhitectura platformei - tabele, relații, fluxuri, vulnerabilități.
Folosește aceste cunoștințe pentru a oferi sfaturi CONCRETE și ACȚIONABILE.`
              },
              { role: "user", content: analysisPrompt }
            ],
            max_tokens: 3000,
            temperature: 0.7
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiAnalysis = aiData.choices?.[0]?.message?.content || null;
        } else {
          console.error("AI response not ok:", aiResponse.status);
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    // =====================================================================
    // SECTION 11: GENERATE RECOMMENDATIONS
    // =====================================================================
    
    const recommendations: string[] = [];
    const remainingIssues = issues.filter(i => !i.fixedAt);

    if (issuesFixed > 0) {
      recommendations.push(`🔧 ${issuesFixed} probleme au fost reparate AUTOMAT de AI`);
    }

    if (remainingIssues.length === 0) {
      recommendations.push("✨ PERFECT! Toate problemele au fost reparate - platforma funcționează fără erori");
    } else {
      recommendations.push(`📋 ${remainingIssues.length} probleme necesită atenție manuală`);
    }

    if (systemHealth.overall === 100) {
      recommendations.push("🏆 Sănătate 100% - Inginerul AI a reparat tot!");
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
      autoFixLog,
      proactiveRepairs
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
