import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useListingLimit = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['listing-limit', user?.id],
    queryFn: async () => {
      if (!user) return { currentCount: 0, maxListings: null, canCreateMore: false, hasActivePlan: false };

      // Check for active seller plan
      const { data: activePlan } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .neq('plan_type', 'bidder')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!activePlan) {
        return {
          currentCount: 0,
          maxListings: 0,
          canCreateMore: false,
          remaining: 0,
          isUnlimited: false,
          hasActivePlan: false,
          planName: null,
        };
      }

      // Count active listings + total quantity
      const { data: listings, error: countError } = await supabase
        .from('listings')
        .select('quantity')
        .eq('seller_id', user.id)
        .eq('is_active', true);

      if (countError) throw countError;

      // Count total units (listings * quantity)
      const totalUnits = (listings || []).reduce((sum, l) => sum + (l.quantity || 1), 0);
      const maxListings = activePlan.max_listings;

      // NULL = unlimited (VIP plan)
      const canCreateMore = maxListings === null ? true : totalUnits < maxListings;

      return {
        currentCount: totalUnits,
        maxListings,
        canCreateMore,
        remaining: maxListings === null ? Infinity : Math.max(0, maxListings - totalUnits),
        isUnlimited: maxListings === null,
        hasActivePlan: true,
        planName: activePlan.plan_name,
        isAuctionPlan: activePlan.is_auction_plan,
      };
    },
    enabled: !!user,
  });
};
