import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound, NotificationSoundType } from '@/hooks/useNotificationSound';

export interface Notification {
  id: string;
  user_id: string;
  type: 'order' | 'message' | 'review' | 'payout' | 'shipping' | 'refund' | 'refund_initiated';
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
  const { playSound, playBellSound } = useNotificationSound();
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
            notification.type === 'refund' || notification.type === 'refund_initiated' ? 'refund' :
            'bell'; // Default to bell sound for general notifications
          
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
  const { playOrderSound, playPayoutSound, playShippingSound, playCancelSound, playRefundSound } = useNotificationSound();

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
        async (payload) => {
          const order = payload.new as any;
          const oldOrder = payload.old as any;
          
          // Check if user is involved in this order
          if (order.buyer_id === user.id || order.seller_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
            
            // 🎉 New order notification for seller with sound
            if (payload.eventType === 'INSERT' && order.seller_id === user.id) {
              // Play cha-ching sound for new order!
              playOrderSound();
              
              // Create notification in database
              await supabase.from('notifications').insert({
                user_id: user.id,
                type: 'order',
                title: '🎉 Comandă nouă primită!',
                message: `Ai vândut un produs pentru £${order.amount?.toFixed(2) || '0.00'}`,
                data: { order_id: order.id }
              });
              
              // Show browser notification
              showBrowserNotification('🎉 Comandă nouă primită!', `Ai vândut un produs pentru £${order.amount?.toFixed(2) || '0.00'}`);
              
              toast({
                title: '🎉 Comandă nouă primită!',
                description: `Ai vândut un produs pentru £${order.amount?.toFixed(2) || '0.00'}. Adaugă tracking-ul în secțiunea Comenzi!`,
              });
            }
            
            if (payload.eventType === 'UPDATE') {
              // 📦 Order shipped notification for buyer
              if (order.status === 'shipped' && oldOrder?.status !== 'shipped' && order.buyer_id === user.id) {
                playShippingSound();
                
                await supabase.from('notifications').insert({
                  user_id: user.id,
                  type: 'shipping',
                  title: '📦 Comanda a fost expediată!',
                  message: 'Vânzătorul a expediat comanda ta.',
                  data: { order_id: order.id, tracking: order.tracking_number }
                });
                
                showBrowserNotification('📦 Comanda a fost expediată!', 'Vânzătorul a expediat comanda ta.');
                
                toast({
                  title: '📦 Comanda a fost expediată!',
                  description: 'Vânzătorul a expediat comanda ta.',
                });
              }
              
              // 🪙 COIN SOUND: When seller receives payout (delivery confirmed)
              if (order.status === 'delivered' && oldOrder?.status !== 'delivered' && order.seller_id === user.id) {
                const payoutAmount = order.payout_amount || (order.amount * 0.9);
                
                // Play coin drop sound! 🎵
                playPayoutSound();
                
                await supabase.from('notifications').insert({
                  user_id: user.id,
                  type: 'payout',
                  title: '💰 Bani Primiți!',
                  message: `£${payoutAmount.toFixed(2)} au fost adăugați la soldul tău disponibil.`,
                  data: { order_id: order.id, amount: payoutAmount }
                });
                
                showBrowserNotification('💰 Bani Primiți!', `£${payoutAmount.toFixed(2)} au fost adăugați la soldul tău disponibil.`);
                
                toast({
                  title: '💰 Bani Primiți!',
                  description: `£${payoutAmount.toFixed(2)} au fost adăugați la soldul tău disponibil.`,
                });
              }
              
              // ❌ Order cancelled notification
              if (order.status === 'cancelled' && oldOrder?.status !== 'cancelled') {
                playCancelSound();
                
                const isBuyer = order.buyer_id === user.id;
                const title = isBuyer ? '❌ Comanda a fost anulată' : '❌ Comandă anulată';
                const message = isBuyer 
                  ? 'Comanda ta a fost anulată. Vei primi rambursarea în curând.'
                  : 'O comandă a fost anulată de cumpărător.';
                
                await supabase.from('notifications').insert({
                  user_id: user.id,
                  type: 'order',
                  title,
                  message,
                  data: { order_id: order.id, cancelled: true }
                });
                
                showBrowserNotification(title, message);
                
                toast({
                  title,
                  description: message,
                  variant: 'destructive',
                });
              }
              
              // 💸 Refund notification for BUYER
              if ((order.status === 'refunded' || order.refund_status === 'processing') && 
                  oldOrder?.status !== 'refunded' && order.buyer_id === user.id) {
                playRefundSound();
                
                const refundAmount = order.refund_amount || order.amount;
                
                await supabase.from('notifications').insert({
                  user_id: user.id,
                  type: 'payout',
                  title: '💸 Rambursare în Curs',
                  message: `Rambursarea de £${refundAmount?.toFixed(2) || '0.00'} este în procesare. Vei primi banii în curând.`,
                  data: { order_id: order.id, refunded: true, refund_amount: refundAmount }
                });
                
                showBrowserNotification('💸 Rambursare în Curs', `Rambursarea de £${refundAmount?.toFixed(2)} este în procesare.`);
                
                toast({
                  title: '💸 Rambursare în Curs',
                  description: `Rambursarea de £${refundAmount?.toFixed(2) || '0.00'} este în procesare. Vei primi banii în curând.`,
                });
              }
              
              // 💸 Refund notification for SELLER
              if ((order.status === 'refunded' || order.refund_status === 'processing') && 
                  oldOrder?.status !== 'refunded' && order.seller_id === user.id) {
                playCancelSound(); // Seller hears a different sound
                
                const refundAmount = order.refund_amount || order.amount;
                
                await supabase.from('notifications').insert({
                  user_id: user.id,
                  type: 'order',
                  title: '🔄 Comandă Rambursată',
                  message: `O comandă de £${refundAmount?.toFixed(2) || '0.00'} a fost rambursată. Motiv: ${order.refund_reason || 'Nespecificat'}`,
                  data: { order_id: order.id, refunded: true, refund_amount: refundAmount, reason: order.refund_reason }
                });
                
                showBrowserNotification('🔄 Comandă Rambursată', `O comandă de £${refundAmount?.toFixed(2)} a fost rambursată.`);
                
                toast({
                  title: '🔄 Comandă Rambursată',
                  description: `O comandă de £${refundAmount?.toFixed(2) || '0.00'} a fost rambursată.`,
                  variant: 'destructive',
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
  }, [user, queryClient, toast, playOrderSound, playPayoutSound, playShippingSound, playCancelSound, playRefundSound]);
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
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
            
            // Create notification in database
            await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'order',
              title: '🔔 Licitație Nouă!',
              message: `Ai primit o ofertă de £${bid.amount.toFixed(2)} pe "${listing.title}".`,
              data: { listing_id: bid.listing_id, bid_amount: bid.amount }
            });
            
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

// Hook for real-time friend requests
export const useRealTimeFriendRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { playFriendSound } = useNotificationSound();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`friendships:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`,
        },
        async (payload) => {
          const friendship = payload.new as any;
          
          if (friendship.status === 'pending') {
            // Get requester info
            const { data: requester } = await supabase
              .from('profiles')
              .select('display_name, username')
              .eq('user_id', friendship.requester_id)
              .single();
            
            const requesterName = requester?.display_name || requester?.username || 'Cineva';
            
            queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
            
            // Create notification in database
            await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'message',
              title: '👋 Cerere de prietenie nouă',
              message: `${requesterName} vrea să fie prieten cu tine.`,
              data: { friendship_id: friendship.id, requester_id: friendship.requester_id }
            });
            
            // Play friend sound
            playFriendSound();
            
            showBrowserNotification('👋 Cerere de prietenie', `${requesterName} vrea să fie prieten cu tine.`);
            
            toast({
              title: '👋 Cerere de prietenie nouă',
              description: `${requesterName} vrea să fie prieten cu tine.`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${user.id}`,
        },
        async (payload) => {
          const friendship = payload.new as any;
          
          if (friendship.status === 'accepted') {
            // Get addressee info
            const { data: addressee } = await supabase
              .from('profiles')
              .select('display_name, username')
              .eq('user_id', friendship.addressee_id)
              .single();
            
            const addresseeName = addressee?.display_name || addressee?.username || 'Utilizator';
            
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['sent-friend-requests'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
            
            // Create notification in database
            await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'message',
              title: '🎉 Cerere acceptată!',
              message: `${addresseeName} a acceptat cererea ta de prietenie.`,
              data: { friendship_id: friendship.id, friend_id: friendship.addressee_id }
            });
            
            // Play friend sound
            playFriendSound();
            
            showBrowserNotification('🎉 Cerere acceptată!', `${addresseeName} a acceptat cererea ta de prietenie.`);
            
            toast({
              title: '🎉 Cerere acceptată!',
              description: `${addresseeName} a acceptat cererea ta de prietenie.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast, playFriendSound]);
};
