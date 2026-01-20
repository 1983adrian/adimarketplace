import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  subscribed: boolean;
  status: string;
  subscription_end: string | null;
  canCreateListings: boolean;
  isTrialPeriod?: boolean;
  trialDaysRemaining?: number;
  trialExpired?: boolean;
}

export const useSellerSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['seller-subscription', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user) {
        return {
          subscribed: false,
          status: 'inactive',
          subscription_end: null,
          canCreateListings: false,
        };
      }

      // Check subscription status from database
      const { data: subscription, error } = await supabase
        .from('seller_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking subscription:', error);
        return {
          subscribed: false,
          status: 'inactive',
          subscription_end: null,
          canCreateListings: false,
        };
      }

      // No subscription found - check if they should get trial
      if (!subscription) {
        // Create trial subscription for new sellers
        const trialEndDate = new Date();
        trialEndDate.setMonth(trialEndDate.getMonth() + 3);

        const { data: newSub, error: createError } = await supabase
          .from('seller_subscriptions')
          .insert({
            user_id: user.id,
            status: 'trial',
            trial_start_date: new Date().toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            subscription_amount: 1.00,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating trial subscription:', createError);
          return {
            subscribed: false,
            status: 'inactive',
            subscription_end: null,
            canCreateListings: false,
          };
        }

        const daysRemaining = Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        return {
          subscribed: true,
          status: 'trial',
          subscription_end: trialEndDate.toISOString(),
          canCreateListings: true,
          isTrialPeriod: true,
          trialDaysRemaining: daysRemaining,
          trialExpired: false,
        };
      }

      // Check trial period
      const now = new Date();
      const trialEnd = subscription.trial_end_date ? new Date(subscription.trial_end_date) : null;
      const isInTrial = trialEnd && now < trialEnd;
      const trialExpired = trialEnd && now >= trialEnd && subscription.status === 'trial';
      
      if (isInTrial) {
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          subscribed: true,
          status: 'trial',
          subscription_end: subscription.trial_end_date,
          canCreateListings: true,
          isTrialPeriod: true,
          trialDaysRemaining: daysRemaining,
          trialExpired: false,
        };
      }

      // Trial expired - check if they have active subscription
      if (subscription.status === 'active') {
        return {
          subscribed: true,
          status: 'active',
          subscription_end: subscription.current_period_end,
          canCreateListings: true,
          isTrialPeriod: false,
          trialExpired: false,
        };
      }

      // Trial expired and no active subscription
      return {
        subscribed: false,
        status: 'expired',
        subscription_end: null,
        canCreateListings: false,
        isTrialPeriod: false,
        trialExpired: true,
      };
    },
    enabled: !!user,
    refetchInterval: 60000,
    staleTime: 30000,
  });
};

export const useCreateSellerSubscription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // For now, just activate the subscription (payment will be handled by Adyen/Mangopay later)
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { data, error } = await supabase
        .from('seller_subscriptions')
        .upsert({
          user_id: user.id,
          status: 'active',
          current_period_end: periodEnd.toISOString(),
          subscription_amount: 1.00,
          payment_processor: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-subscription'] });
    },
  });
};

export const useSellerPortal = () => {
  return useMutation({
    mutationFn: async () => {
      // This will be handled by Adyen/Mangopay portal later
      return { url: '/settings?tab=payouts' };
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
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
