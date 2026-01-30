import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SellerLimit {
  id: string;
  user_id: string;
  max_active_listings: number;
  max_monthly_sales: number;
  current_monthly_sales: number;
  limit_tier: 'new' | 'standard' | 'trusted' | 'unlimited';
  tier_upgraded_at: string | null;
  created_at: string;
  updated_at: string;
}

// Get seller limits for current user
export const useSellerLimits = (userId?: string) => {
  return useQuery({
    queryKey: ['seller-limits', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('seller_limits' as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as unknown as SellerLimit | null;
    },
    enabled: !!userId,
  });
};

// Create default seller limits for new sellers
export const useCreateSellerLimits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('seller_limits' as any)
        .insert({
          user_id: userId,
          max_active_listings: 10,
          max_monthly_sales: 5000,
          current_monthly_sales: 0,
          limit_tier: 'new',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['seller-limits', userId] });
    },
  });
};

// Admin function to update seller limits
export const useUpdateSellerLimits = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      maxActiveListings,
      maxMonthlySales,
      limitTier,
    }: {
      userId: string;
      maxActiveListings?: number;
      maxMonthlySales?: number;
      limitTier?: string;
    }) => {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (maxActiveListings !== undefined) updateData.max_active_listings = maxActiveListings;
      if (maxMonthlySales !== undefined) updateData.max_monthly_sales = maxMonthlySales;
      if (limitTier !== undefined) {
        updateData.limit_tier = limitTier;
        updateData.tier_upgraded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('seller_limits' as any)
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['seller-limits', userId] });
      toast({ title: 'Limite actualizate' });
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });
};

// Tier definitions with limits
export const SELLER_TIERS = {
  new: {
    name: 'Vânzător Nou',
    maxListings: 10,
    maxMonthlySales: 5000,
    description: 'Limite inițiale pentru vânzători noi',
  },
  standard: {
    name: 'Vânzător Standard',
    maxListings: 50,
    maxMonthlySales: 25000,
    description: 'După 5 vânzări completate cu rating 4+',
  },
  trusted: {
    name: 'Vânzător de Încredere',
    maxListings: 200,
    maxMonthlySales: 100000,
    description: 'După 25 vânzări cu rating 4.5+ și KYC verificat',
  },
  unlimited: {
    name: 'Vânzător Premium',
    maxListings: null,
    maxMonthlySales: null,
    description: 'Fără limite - după 100+ vânzări cu rating excelent',
  },
};
