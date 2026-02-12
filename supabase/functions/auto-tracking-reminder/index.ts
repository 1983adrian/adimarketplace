import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find orders that are paid/pending but have no tracking number
    // and were created more than 48 hours ago
    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, seller_id, listing_id, created_at, listings(title)')
      .in('status', ['paid', 'pending'])
      .is('tracking_number', null)
      .lt('created_at', cutoffDate);

    if (error) throw error;

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ message: 'No orders missing tracking', notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group by seller
    const sellerOrders: Record<string, { count: number; titles: string[] }> = {};
    for (const order of orders) {
      if (!sellerOrders[order.seller_id]) {
        sellerOrders[order.seller_id] = { count: 0, titles: [] };
      }
      sellerOrders[order.seller_id].count++;
      const title = (order.listings as any)?.title || 'Produs';
      if (!sellerOrders[order.seller_id].titles.includes(title)) {
        sellerOrders[order.seller_id].titles.push(title);
      }
    }

    // Send notification + email to each seller
    let notified = 0;
    for (const [sellerId, data] of Object.entries(sellerOrders)) {
      const productList = data.titles.slice(0, 3).join(', ');
      const extra = data.titles.length > 3 ? ` și alte ${data.titles.length - 3}` : '';

      // In-app notification for seller
      await supabase.from('notifications').insert({
        user_id: sellerId,
        type: 'tracking_reminder',
        title: `⚠️ ${data.count} comenzi fără AWB`,
        message: `Ai ${data.count} comenzi care așteaptă numărul de urmărire: ${productList}${extra}. Adaugă AWB-ul pentru a evita întârzierile și protecția PayPal.`,
      });

      // Email notification
      try {
        await supabase.functions.invoke('send-seller-email', {
          body: { type: 'tracking_reminder', seller_id: sellerId }
        });
      } catch (e) {
        console.error('Failed to send tracking email to', sellerId, e);
      }

      // Web Push notification (phone notification bar for PWA users)
      try {
        await supabase.functions.invoke('send-web-push', {
          body: {
            user_id: sellerId,
            title: `⚠️ ${data.count} comenzi fără AWB`,
            body: `Adaugă numărul de urmărire pentru: ${productList}${extra}`,
            data: { type: 'tracking_reminder', orders_count: data.count },
          }
        });
      } catch (e) {
        console.error('Failed to send web push to', sellerId, e);
      }

      notified++;
    }

    // 🔔 Notify ALL admins about orders missing tracking
    const { data: adminEmails } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('is_active', true);

    if (adminEmails && adminEmails.length > 0) {
      // Get admin user IDs from auth
      for (const adminEntry of adminEmails) {
        const { data: adminUsers } = await supabase.auth.admin.listUsers();
        const adminUser = adminUsers?.users?.find(
          (u: any) => u.email?.toLowerCase() === adminEntry.email.toLowerCase()
        );

        if (adminUser) {
          // Build summary for admin
          const sellerCount = Object.keys(sellerOrders).length;
          const totalOrders = orders.length;

          await supabase.from('notifications').insert({
            user_id: adminUser.id,
            type: 'tracking_reminder',
            title: `🚨 ${totalOrders} comenzi fără AWB`,
            message: `${sellerCount} vânzători au ${totalOrders} comenzi neexpediate de peste 48h. Verifică panoul de control.`,
            data: {
              admin_notification: true,
              sellers_affected: sellerCount,
              orders_affected: totalOrders,
            },
          });
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: `Notified ${notified} sellers and admins about ${orders.length} orders missing tracking`,
      notified,
      ordersAffected: orders.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
