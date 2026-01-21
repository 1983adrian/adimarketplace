import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Refund {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  reason: string;
  status: string;
  requested_by: string;
  processor: string | null;
  processor_refund_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useMyRefunds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['refunds', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('refunds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Refund[];
    },
    enabled: !!user,
  });
}

export function useRequestRefund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, reason, amount }: { orderId: string; reason: string; amount?: number }) => {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: { order_id: orderId, reason, amount },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Refund failed');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Rambursare Inițiată',
        description: `Suma de £${data.refund?.amount?.toFixed(2)} va fi rambursată.`,
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
}

export function useAdminRefunds() {
  return useQuery({
    queryKey: ['admin-refunds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refunds')
        .select(`
          *,
          orders (
            id,
            amount,
            status,
            listing_id,
            listings (title)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
