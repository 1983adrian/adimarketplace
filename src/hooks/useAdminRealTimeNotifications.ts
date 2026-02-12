import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationSound } from '@/hooks/useNotificationSound';

/**
 * Admin-only real-time notifications.
 * Listens to ALL orders, disputes, returns, and listing reports on the platform.
 * Only activates when the logged-in user is an admin.
 */
export const useAdminRealTimeNotifications = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { playOrderSound, playSound } = useNotificationSound();
  const processedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !isAdmin) return;

    const channel = supabase
      .channel(`admin-platform-events:${user.id}`)
      // 🛒 ALL new orders on the platform
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          const order = payload.new as any;
          const eventKey = `order-${order.id}`;
          if (processedEvents.current.has(eventKey)) return;
          processedEvents.current.add(eventKey);

          // Don't duplicate if admin is also the seller
          if (order.seller_id === user.id) return;

          playOrderSound();

          // Get listing title
          let listingTitle = 'Produs';
          if (order.listing_id) {
            const { data: listing } = await supabase
              .from('listings')
              .select('title')
              .eq('id', order.listing_id)
              .single();
            if (listing) listingTitle = listing.title;
          }

          // Insert admin notification
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'order',
            title: '🛒 Comandă Nouă pe Platformă',
            message: `"${listingTitle}" — £${order.amount?.toFixed(2) || '0.00'}`,
            data: { order_id: order.id, admin_notification: true },
          });

          toast({
            title: '🛒 Comandă Nouă pe Platformă',
            description: `"${listingTitle}" — £${order.amount?.toFixed(2) || '0.00'}`,
          });

          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }
      )
      // ⚠️ ALL new disputes
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'disputes',
        },
        async (payload) => {
          const dispute = payload.new as any;
          const eventKey = `dispute-${dispute.id}`;
          if (processedEvents.current.has(eventKey)) return;
          processedEvents.current.add(eventKey);

          playSound('bell');

          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'order',
            title: '⚠️ Dispută Nouă pe Platformă',
            message: `Motiv: ${dispute.reason || 'Nespecificat'}`,
            data: { dispute_id: dispute.id, order_id: dispute.order_id, admin_notification: true },
          });

          toast({
            title: '⚠️ Dispută Nouă pe Platformă',
            description: `Motiv: ${dispute.reason || 'Nespecificat'}. Verifică panoul admin.`,
            variant: 'destructive',
          });

          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
          queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
        }
      )
      // 📦 ALL new returns
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'returns',
        },
        async (payload) => {
          const returnReq = payload.new as any;
          const eventKey = `return-${returnReq.id}`;
          if (processedEvents.current.has(eventKey)) return;
          processedEvents.current.add(eventKey);

          playSound('bell');

          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'shipping',
            title: '📦 Retur Nou pe Platformă',
            message: `Motiv: ${returnReq.reason || 'Nespecificat'}`,
            data: { return_id: returnReq.id, order_id: returnReq.order_id, admin_notification: true },
          });

          toast({
            title: '📦 Retur Nou pe Platformă',
            description: `Motiv: ${returnReq.reason || 'Nespecificat'}`,
          });

          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
          queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
        }
      )
      // 🚨 ALL new listing reports
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'listing_reports',
        },
        async (payload) => {
          const report = payload.new as any;
          const eventKey = `report-${report.id}`;
          if (processedEvents.current.has(eventKey)) return;
          processedEvents.current.add(eventKey);

          playSound('bell');

          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'order',
            title: '🚨 Raport Anunț Nou',
            message: `Motiv: ${report.reason || 'Nespecificat'}`,
            data: { report_id: report.id, listing_id: report.listing_id, admin_notification: true },
          });

          toast({
            title: '🚨 Raport Anunț Nou',
            description: `Un utilizator a raportat un anunț. Verifică panoul admin.`,
            variant: 'destructive',
          });

          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
        }
      )
      // 🔔 ALL new fraud alerts
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fraud_alerts',
        },
        async (payload) => {
          const alert = payload.new as any;
          const eventKey = `fraud-${alert.id}`;
          if (processedEvents.current.has(eventKey)) return;
          processedEvents.current.add(eventKey);

          playSound('bell');

          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'order',
            title: '🔴 Alertă Fraudă!',
            message: alert.title || 'Activitate suspectă detectată',
            data: { fraud_alert_id: alert.id, admin_notification: true },
          });

          toast({
            title: '🔴 Alertă Fraudă!',
            description: alert.title || 'Activitate suspectă detectată. Verifică imediat.',
            variant: 'destructive',
          });

          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
          queryClient.invalidateQueries({ queryKey: ['admin-fraud-alerts'] });
        }
      )
      .subscribe();

    // Cleanup old processed events periodically
    const cleanup = setInterval(() => {
      if (processedEvents.current.size > 500) {
        processedEvents.current.clear();
      }
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanup);
    };
  }, [user, isAdmin, toast, queryClient, playOrderSound, playSound]);
};
