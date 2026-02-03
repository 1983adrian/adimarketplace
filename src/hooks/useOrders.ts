import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: string;
  shipping_address: string | null;
  tracking_number: string | null;
  carrier: string | null;
  delivery_confirmed_at: string | null;
  payout_amount: number | null;
  payout_status: string | null;
  buyer_fee: number | null;
  seller_commission: number | null;
  dispute_opened_at: string | null;
  dispute_reason: string | null;
  dispute_resolved_at: string | null;
  cancelled_at: string | null;
  refund_status: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
  listings?: {
    id: string;
    title: string;
    price: number;
    listing_images?: { image_url: string; is_primary: boolean }[];
  };
  buyer_profile?: {
    display_name: string | null;
    username: string | null;
  };
  seller_profile?: {
    display_name: string | null;
    username: string | null;
  };
}

export const useMyOrders = (type: 'buying' | 'selling') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', type, user?.id],
    queryFn: async () => {
      const column = type === 'buying' ? 'buyer_id' : 'seller_id';
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          listings (
            id,
            title,
            price,
            listing_images (image_url, is_primary)
          )
        `)
        .eq(column, user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch seller profiles for buyer orders using secure public view
      if (type === 'buying' && data && data.length > 0) {
        const sellerIds = [...new Set(data.map(o => o.seller_id))];
        const { data: profiles } = await supabase
          .from('public_seller_profiles')
          .select('user_id, display_name, username')
          .in('user_id', sellerIds);
        
        return data.map(order => ({
          ...order,
          seller_profile: profiles?.find(p => p.user_id === order.seller_id),
        })) as Order[];
      }
      
      return data as Order[];
    },
    enabled: !!user,
  });
};

export const useUpdateTracking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      trackingNumber, 
      carrier 
    }: { 
      orderId: string; 
      trackingNumber: string; 
      carrier: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('update-tracking', {
        body: {
          order_id: orderId,
          tracking_number: trackingNumber,
          carrier,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Tracking updated',
        description: 'Order marked as shipped',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useConfirmDelivery = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('process-payout', {
        body: { order_id: orderId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Payout failed');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Livrare confirmată!',
        description: `Vânzătorul va primi £${data.payout?.net_amount?.toFixed(2) || '0.00'} după deducerea comisioanelor`,
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
