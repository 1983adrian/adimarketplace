import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays, differenceInHours, addDays } from 'date-fns';

const TRIAL_DAYS = 30;
const TRIAL_MAX_LISTINGS = 10;
const EXPIRY_WARNING_DAYS = 3;
const BLOCK_AFTER_HOURS = 72;

export interface TrialStatus {
  isInTrial: boolean;
  trialDaysRemaining: number;
  trialExpired: boolean;
  trialStartedAt: string | null;
  trialExpiresAt: string | null;
  isListingBlocked: boolean;
  isBuyingBlocked: boolean;
  blockedReason: string | null;
  shouldWarnExpiry: boolean; // 3 days before
  hoursUntilBlock: number | null; // after expiry, hours until auto-block
  needsSubscription: boolean;
  maxTrialListings: number;
}

export const useSellerTrial = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['seller-trial', user?.id],
    queryFn: async (): Promise<TrialStatus> => {
      if (!user) {
        return {
          isInTrial: false, trialDaysRemaining: 0, trialExpired: false,
          trialStartedAt: null, trialExpiresAt: null,
          isListingBlocked: false, isBuyingBlocked: false, blockedReason: null,
          shouldWarnExpiry: false, hoursUntilBlock: null,
          needsSubscription: false, maxTrialListings: TRIAL_MAX_LISTINGS,
        };
      }

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('seller_trial_started_at, is_listing_blocked, is_buying_blocked, blocked_reason, is_seller')
        .eq('user_id', user.id)
        .single();

      if (!profile || !profile.is_seller) {
        return {
          isInTrial: false, trialDaysRemaining: 0, trialExpired: false,
          trialStartedAt: null, trialExpiresAt: null,
          isListingBlocked: profile?.is_listing_blocked || false,
          isBuyingBlocked: profile?.is_buying_blocked || false,
          blockedReason: profile?.blocked_reason || null,
          shouldWarnExpiry: false, hoursUntilBlock: null,
          needsSubscription: false, maxTrialListings: TRIAL_MAX_LISTINGS,
        };
      }

      // Check if user has an active paid subscription
      const { data: activeSub } = await supabase
        .from('user_subscriptions')
        .select('id, plan_type, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .neq('plan_type', 'bidder')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const hasActiveSubscription = !!activeSub;

      const trialStartedAt = profile.seller_trial_started_at;
      
      if (!trialStartedAt) {
        // No trial started yet - they need to start one or subscribe
        return {
          isInTrial: false, trialDaysRemaining: TRIAL_DAYS, trialExpired: false,
          trialStartedAt: null, trialExpiresAt: null,
          isListingBlocked: profile.is_listing_blocked || false,
          isBuyingBlocked: profile.is_buying_blocked || false,
          blockedReason: profile.blocked_reason || null,
          shouldWarnExpiry: false, hoursUntilBlock: null,
          needsSubscription: !hasActiveSubscription,
          maxTrialListings: TRIAL_MAX_LISTINGS,
        };
      }

      const trialStart = new Date(trialStartedAt);
      const trialEnd = addDays(trialStart, TRIAL_DAYS);
      const now = new Date();
      const daysRemaining = Math.max(0, differenceInDays(trialEnd, now));
      const trialExpired = now > trialEnd;
      const shouldWarnExpiry = !trialExpired && daysRemaining <= EXPIRY_WARNING_DAYS;

      let hoursUntilBlock: number | null = null;
      if (trialExpired && !hasActiveSubscription) {
        const blockTime = addDays(trialEnd, 3); // 72 hours = 3 days
        hoursUntilBlock = Math.max(0, differenceInHours(blockTime, now));
      }

      return {
        isInTrial: !trialExpired && !hasActiveSubscription,
        trialDaysRemaining: daysRemaining,
        trialExpired,
        trialStartedAt,
        trialExpiresAt: trialEnd.toISOString(),
        isListingBlocked: profile.is_listing_blocked || false,
        isBuyingBlocked: profile.is_buying_blocked || false,
        blockedReason: profile.blocked_reason || null,
        shouldWarnExpiry,
        hoursUntilBlock,
        needsSubscription: trialExpired && !hasActiveSubscription,
        maxTrialListings: TRIAL_MAX_LISTINGS,
      };
    },
    enabled: !!user,
    staleTime: 30000,
  });
};

// Start the free trial for a new seller
export const useStartSellerTrial = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Trebuie să fii autentificat');

      // Also create a free trial subscription entry
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'start',
          plan_name: 'Plan START (Trial Gratuit)',
          price_ron: 0,
          max_listings: TRIAL_MAX_LISTINGS,
          is_auction_plan: false,
          status: 'active',
          trial_plan: true,
        });

      if (subError) throw subError;

      // Set trial start date
      const { error } = await supabase
        .from('profiles')
        .update({
          seller_trial_started_at: new Date().toISOString(),
          is_listing_blocked: false,
          is_buying_blocked: false,
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-trial'] });
      queryClient.invalidateQueries({ queryKey: ['active-seller-plan'] });
      queryClient.invalidateQueries({ queryKey: ['listing-limit'] });
    },
  });
};
