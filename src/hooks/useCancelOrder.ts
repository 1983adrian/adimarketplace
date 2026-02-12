import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      reason 
    }: { 
      orderId: string; 
      reason: string;
    }) => {
      // Get order details first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, listings(title, seller_id), buyer_id')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Comanda nu a fost găsită');

      // Only allow cancellation of pending or paid orders within 24 hours
      if (!['pending', 'paid'].includes(order.status)) {
        throw new Error('Această comandă nu poate fi anulată');
      }

      const hoursSinceOrder = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursSinceOrder > 24) {
        throw new Error('Comanda poate fi anulată doar în primele 24 de ore de la plasare.');
      }

      // Update order status to cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Notify buyer about cancellation
      await supabase.from('notifications').insert({
        user_id: order.buyer_id,
        type: 'order',
        title: '❌ Comandă Anulată',
        message: `Vânzătorul a anulat comanda pentru "${order.listings?.title}". Motiv: ${reason}`,
        data: { order_id: orderId, reason },
      });

      return { success: true, order };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Comandă anulată',
        description: 'Comanda a fost anulată și cumpărătorul a fost notificat.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeclineBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      listingId, 
      bidId,
      bidderId,
      reason 
    }: { 
      listingId: string;
      bidId: string;
      bidderId: string;
      reason: string;
    }) => {
      // Get listing title for notification
      const { data: listing } = await supabase
        .from('listings')
        .select('title')
        .eq('id', listingId)
        .single();

      // Delete the bid (or mark as declined if you prefer soft delete)
      const { error: deleteError } = await supabase
        .from('bids')
        .delete()
        .eq('id', bidId);

      if (deleteError) throw deleteError;

      // Notify bidder about decline
      await supabase.from('notifications').insert({
        user_id: bidderId,
        type: 'bid',
        title: '🚫 Ofertă Refuzată',
        message: `Vânzătorul a refuzat oferta ta pentru "${listing?.title || 'produs'}". Motiv: ${reason}`,
        data: { listing_id: listingId, bid_id: bidId, reason },
      });

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bids', variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ['highest-bid', variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ['my-auction-listings'] });
      toast({
        title: 'Ofertă refuzată',
        description: 'Oferta a fost refuzată și ofertantul a fost notificat.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
