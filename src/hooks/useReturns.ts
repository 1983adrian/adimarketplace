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
