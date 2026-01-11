import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  subscribed: boolean;
  status: string;
  subscription_end: string | null;
  canCreateListings: boolean;
}

export const useSellerSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['seller-subscription', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data, error } = await supabase.functions.invoke('check-seller-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return {
          subscribed: false,
          status: 'inactive',
          subscription_end: null,
          canCreateListings: false,
        };
      }

      return data;
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
};

export const useCreateSellerSubscription = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-seller-subscription');
      
      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
  });
};

export const useSellerPortal = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seller-customer-portal');
      
      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
  });
};

export const usePlatformFees = () => {
  return useQuery({
    queryKey: ['platform-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_fees')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });
};
