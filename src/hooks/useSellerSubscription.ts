import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';

// Exchange rates for subscription price display (base: GBP = £1)
const EXCHANGE_RATES: Record<string, number> = {
  GBP: 1,
  EUR: 1.17,
  USD: 1.27,
  RON: 5.82,
  PLN: 5.06,
  CZK: 29.5,
  HUF: 460,
  BGN: 2.29,
  SEK: 13.5,
  DKK: 8.72,
  NOK: 13.8,
  CHF: 1.12,
};

const BASE_SUBSCRIPTION_GBP = 1.00;

interface SubscriptionStatus {
  subscribed: boolean;
  status: string;
  subscription_end: string | null;
  canCreateListings: boolean;
  isTrialPeriod?: boolean;
  trialDaysRemaining?: number;
  trialExpired?: boolean;
  localAmount?: number;
  localCurrency?: string;
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

      // Get user's country for currency conversion
      const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_country, country_of_residence')
        .eq('user_id', user.id)
        .single();

      const userCountry = profile?.kyc_country || profile?.country_of_residence || 'GB';
      const countryCurrency: Record<string, string> = {
        GB: 'GBP', UK: 'GBP', RO: 'RON', DE: 'EUR', FR: 'EUR', PL: 'PLN',
        CZ: 'CZK', HU: 'HUF', US: 'USD', BG: 'BGN',
      };
      const userCurrency = countryCurrency[userCountry] || 'GBP';
      const localAmount = Math.ceil(BASE_SUBSCRIPTION_GBP * (EXCHANGE_RATES[userCurrency] || 1) * 100) / 100;

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
            subscription_amount: localAmount,
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
          localAmount,
          localCurrency: userCurrency,
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
          localAmount,
          localCurrency: userCurrency,
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
          localAmount,
          localCurrency: userCurrency,
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
        localAmount,
        localCurrency: userCurrency,
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

  return useMutation<unknown, Error, string | void>({
    mutationFn: async (currency) => {
      if (!user) throw new Error('User not authenticated');

      // Call the edge function to process subscription payment
      const { data, error } = await supabase.functions.invoke('process-subscription', {
        body: {
          action: 'charge',
          user_id: user.id,
          currency: currency || undefined,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Subscription failed');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-subscription'] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('process-subscription', {
        body: {
          action: 'cancel',
          user_id: user.id,
        },
      });

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
      // Redirect to settings payout section
      return { url: '/settings?tab=payouts' };
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
  });
};

// Hook to get subscription price in user's local currency
export const useSubscriptionPrice = () => {
  const { currency, convertPrice, formatPrice } = useCurrency();
  
  const priceInLocalCurrency = convertPrice(BASE_SUBSCRIPTION_GBP);
  const formattedPrice = formatPrice(BASE_SUBSCRIPTION_GBP);
  
  return {
    basePrice: BASE_SUBSCRIPTION_GBP,
    localPrice: Math.ceil(priceInLocalCurrency * 100) / 100,
    currency,
    formattedPrice,
    displayPrice: formattedPrice,
  };
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
