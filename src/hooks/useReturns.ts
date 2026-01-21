import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Return {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  refund_amount: number | null;
  admin_notes: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export const useMyReturns = (type: 'buyer' | 'seller') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['returns', type, user?.id],
    queryFn: async () => {
      const column = type === 'buyer' ? 'buyer_id' : 'seller_id';
      
      const { data, error } = await supabase
        .from('returns')
        .select(`
          *,
          orders (
            id,
            amount,
            listings (
              id,
              title,
              price,
              listing_images (image_url, is_primary)
            )
          )
        `)
        .eq(column, user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// Get seller's default address for return shipping
export const useSellerReturnAddress = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-return-address', sellerId],
    queryFn: async () => {
      if (!sellerId) return null;
      
      // First try to get default address
      const { data: defaultAddr, error: defaultError } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', sellerId)
        .eq('is_default', true)
        .maybeSingle();

      if (defaultAddr) return defaultAddr;

      // If no default, get any address
      const { data: anyAddr, error: anyError } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (anyError) throw anyError;
      return anyAddr;
    },
    enabled: !!sellerId,
  });
};

export const useCreateReturn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orderId,
      buyerId,
      sellerId,
      reason,
      description,
    }: {
      orderId: string;
      buyerId: string;
      sellerId: string;
      reason: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('returns')
        .insert({
          order_id: orderId,
          buyer_id: buyerId,
          seller_id: sellerId,
          reason,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast({
        title: 'Cerere de retur trimisă',
        description: 'Vânzătorul va fi notificat și va procesa cererea ta.',
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

// Buyer adds return tracking number
export const useAddReturnTracking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      returnId,
      trackingNumber,
    }: {
      returnId: string;
      trackingNumber: string;
    }) => {
      const { data, error } = await supabase
        .from('returns')
        .update({
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', returnId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast({
        title: 'AWB adăugat',
        description: 'Numărul de urmărire a fost salvat. Vânzătorul va fi notificat.',
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

export const useUpdateReturnStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      returnId,
      status,
      adminNotes,
      refundAmount,
    }: {
      returnId: string;
      status: Return['status'];
      adminNotes?: string;
      refundAmount?: number;
    }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString(),
      };
      
      if (adminNotes) updateData.admin_notes = adminNotes;
      if (refundAmount) updateData.refund_amount = refundAmount;
      if (status === 'completed' || status === 'rejected') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('returns')
        .update(updateData)
        .eq('id', returnId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast({
        title: 'Status actualizat',
        description: 'Statusul returului a fost actualizat.',
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
