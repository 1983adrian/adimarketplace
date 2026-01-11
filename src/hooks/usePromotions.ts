import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Promotion {
  id: string;
  listing_id: string;
  seller_id: string;
  promotion_type: 'social_share' | 'paid';
  platform: string | null;
  share_url: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  amount_paid: number;
  created_at: string;
}

interface PromotedListing {
  id: string;
  title: string;
  price: number;
  listing_images: { image_url: string; is_primary: boolean }[];
  condition: string;
  location: string | null;
  seller_id: string;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

export const usePromotedListings = () => {
  return useQuery({
    queryKey: ['promoted-listings'],
    queryFn: async (): Promise<PromotedListing[]> => {
      const now = new Date().toISOString();
      
      const response = await supabase
        .from('listing_promotions' as any)
        .select('listing_id')
        .eq('is_active', true)
        .gt('ends_at', now);

      const promotions = response.data as unknown as { listing_id: string }[] | null;
      
      if (response.error || !promotions || promotions.length === 0) return [];

      const { data: listings, error } = await supabase
        .from('listings')
        .select(`id, title, price, condition, location, seller_id, listing_images (image_url, is_primary)`)
        .in('id', promotions.map(p => p.listing_id))
        .eq('is_active', true)
        .eq('is_sold', false);

      if (error || !listings) return [];

      const sellerIds = [...new Set(listings.map(l => l.seller_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', sellerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return listings.map(listing => ({
        ...listing,
        profiles: profileMap.get(listing.seller_id) || null
      })) as PromotedListing[];
    },
    staleTime: 60000,
  });
};

export const useMyPromotions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-promotions', user?.id],
    queryFn: async (): Promise<Promotion[]> => {
      const response = await supabase
        .from('listing_promotions' as any)
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (response.error) throw response.error;
      return (response.data as unknown as Promotion[]) || [];
    },
    enabled: !!user,
  });
};

export const useListingPromotion = (listingId: string) => {
  return useQuery({
    queryKey: ['listing-promotion', listingId],
    queryFn: async (): Promise<Promotion | null> => {
      const response = await supabase
        .from('listing_promotions' as any)
        .select('*')
        .eq('listing_id', listingId)
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();

      if (response.error) throw response.error;
      return response.data as unknown as Promotion | null;
    },
    enabled: !!listingId,
  });
};

export const useCreateSocialPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, platform }: { listingId: string; platform: string }) => {
      const { data, error } = await supabase.functions.invoke('create-social-promotion', { body: { listingId, platform } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoted-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-promotions'] });
    },
  });
};

export const useCreatePaidPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId }: { listingId: string }) => {
      const { data, error } = await supabase.functions.invoke('create-paid-promotion', { body: { listingId } });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { if (data?.url) window.open(data.url, '_blank'); },
  });
};

export const usePromotionFee = () => {
  return useQuery({
    queryKey: ['promotion-fee'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_fees')
        .select('*')
        .eq('fee_type', 'weekly_promotion')
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data;
    },
  });
};
