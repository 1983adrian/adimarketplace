import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound, NotificationSoundType } from '@/hooks/useNotificationSound';

export interface Notification {
  id: string;
  user_id: string;
  type: 'order' | 'message' | 'review' | 'payout' | 'shipping';
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// Request browser notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// Show browser notification
const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: `notification-${Date.now()}`,
        requireInteraction: false,
      });
    } catch (error) {
      console.log('Browser notification failed:', error);
    }
  }
};

export const useNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });
};

export const useUnreadCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications-unread', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useMarkAllRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { playSound } = useNotificationSound();
  const hasRequestedPermission = useRef(false);

  // Request browser notification permission on mount
  useEffect(() => {
    if (!hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      requestNotificationPermission();
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          
          // Play sound based on notification type
          const soundType: NotificationSoundType = 
            notification.type === 'order' ? 'order' :
            notification.type === 'message' ? 'message' :
            notification.type === 'payout' ? 'payout' :
            notification.type === 'shipping' ? 'shipping' :
            'general';
          
          playSound(soundType);
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
          });
          
          // Show browser notification
          showBrowserNotification(notification.title, notification.message);

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, queryClient, playSound]);

  return { isSubscribed };
};

// Hook for real-time messages with notification sound
export const useRealTimeMessages = (conversationId: string | undefined) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { playMessageSound } = useNotificationSound();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as any;
          
          // Show notification if message is from someone else
          if (message.sender_id !== user?.id) {
            // Play message notification sound
            playMessageSound();
            
            // Show browser notification
            showBrowserNotification('💬 Mesaj Nou', message.content?.substring(0, 50) || 'Ai primit un mesaj nou');
            
            toast({
              title: '💬 Mesaj Nou',
              description: message.content?.substring(0, 50) + (message.content?.length > 50 ? '...' : ''),
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, user, toast, playMessageSound]);
};

// Global hook for real-time messages notifications (for users not in chat)
export const useGlobalMessageNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { playMessageSound } = useNotificationSound();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`global-messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const message = payload.new as any;
          
          // Skip own messages
          if (message.sender_id === user.id) return;
          
          // Check if this message is in a conversation the user is part of
          const { data: conversation } = await supabase
            .from('conversations')
            .select('buyer_id, seller_id')
            .eq('id', message.conversation_id)
            .single();
          
          if (conversation && (conversation.buyer_id === user.id || conversation.seller_id === user.id)) {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
            queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
            
            // Get sender info
            const { data: sender } = await supabase
              .from('profiles')
              .select('display_name, username')
              .eq('user_id', message.sender_id)
              .single();

            // Play notification sound
            playMessageSound();
            
            // Get unread count
            const conversationIds = [message.conversation_id];
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .in('conversation_id', conversationIds)
              .eq('is_read', false)
              .neq('sender_id', user.id);

            const unreadText = count && count > 1 ? `${count} mesaje noi` : '1 mesaj nou';
            const senderName = sender?.display_name || sender?.username || 'Utilizator';
            
            // Show browser notification
            showBrowserNotification(`💬 ${senderName}`, `${unreadText}: ${message.content?.substring(0, 40) || ''}`);
            
            toast({
              title: `💬 ${senderName}`,
              description: `${unreadText}: ${message.content?.substring(0, 40) + (message.content?.length > 40 ? '...' : '')}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast, playMessageSound]);
};

// Hook for real-time orders with coin sound for payouts
export const useRealTimeOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { playOrderSound, playPayoutSound, playShippingSound } = useNotificationSound();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`orders:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as any;
          
          // Check if user is involved in this order
          if (order.buyer_id === user.id || order.seller_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            
            // 🎉 New order notification for seller with sound
            if (payload.eventType === 'INSERT' && order.seller_id === user.id) {
              // Play cha-ching sound for new order!
              playOrderSound();
              
              // Show browser notification
              showBrowserNotification('🎉 Comandă nouă primită!', `Ai vândut un produs pentru £${order.amount?.toFixed(2) || '0.00'}`);
              
              toast({
                title: '🎉 Comandă nouă primită!',
                description: `Ai vândut un produs pentru £${order.amount?.toFixed(2) || '0.00'}. Adaugă tracking-ul în secțiunea Comenzi!`,
              });
            }
            
            if (payload.eventType === 'UPDATE') {
              if (order.status === 'shipped' && order.buyer_id === user.id) {
                playShippingSound();
                
                showBrowserNotification('📦 Comanda a fost expediată!', 'Vânzătorul a expediat comanda ta.');
                
                toast({
                  title: '📦 Comanda a fost expediată!',
                  description: 'Vânzătorul a expediat comanda ta.',
                });
              }
              // 🪙 COIN SOUND: When seller receives payout (delivery confirmed)
              if (order.status === 'delivered' && order.seller_id === user.id) {
                const payoutAmount = order.payout_amount || (order.amount * 0.9);
                
                // Play coin drop sound! 🎵
                playPayoutSound();
                
                showBrowserNotification('💰 Bani Primiți!', `£${payoutAmount.toFixed(2)} au fost adăugați la soldul tău disponibil.`);
                
                toast({
                  title: '💰 Bani Primiți!',
                  description: `£${payoutAmount.toFixed(2)} au fost adăugați la soldul tău disponibil.`,
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast, playOrderSound, playPayoutSound, playShippingSound]);
};

// Hook for real-time bids (for sellers)
export const useRealTimeBids = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { playBidSound } = useNotificationSound();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`bids:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
        },
        async (payload) => {
          const bid = payload.new as any;
          
          // Check if this bid is on seller's listing
          const { data: listing } = await supabase
            .from('listings')
            .select('seller_id, title')
            .eq('id', bid.listing_id)
            .single();
          
          if (listing?.seller_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ['bids'] });
            queryClient.invalidateQueries({ queryKey: ['my-auction-listings'] });
            
            // Play bid notification sound
            playBidSound();
            
            showBrowserNotification('🔔 Licitație Nouă!', `Ai primit o ofertă de £${bid.amount.toFixed(2)} pe "${listing.title}".`);
            
            toast({
              title: '🔔 Licitație Nouă!',
              description: `Ai primit o ofertă de £${bid.amount.toFixed(2)} pe "${listing.title}".`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast, playBidSound]);
};
