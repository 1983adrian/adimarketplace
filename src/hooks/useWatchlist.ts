import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WatchlistItem {
  id: string;
  user_id: string;
  listing_id: string;
  notify_price_drop: boolean;
  notify_auction_ending: boolean;
  price_threshold: number | null;
  created_at: string;
  listings?: {
    id: string;
    title: string;
    price: number;
    listing_type: string;
    auction_end_date: string | null;
    is_active: boolean;
    listing_images: { image_url: string; is_primary: boolean }[];
  };
}

export const useWatchlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('watchlist' as any)
        .select(`
          *,
          listings (
            id, title, price, listing_type, auction_end_date, is_active,
            listing_images (image_url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as WatchlistItem[];
    },
    enabled: !!user,
  });
};

export const useAddToWatchlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      listingId,
      notifyPriceDrop = true,
      notifyAuctionEnding = true,
      priceThreshold,
    }: {
      listingId: string;
      notifyPriceDrop?: boolean;
      notifyAuctionEnding?: boolean;
      priceThreshold?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('watchlist' as any)
        .insert({
          user_id: user.id,
          listing_id: listingId,
          notify_price_drop: notifyPriceDrop,
          notify_auction_ending: notifyAuctionEnding,
          price_threshold: priceThreshold || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast({ title: 'Adăugat în Watchlist', description: 'Vei primi notificări pentru acest produs.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('watchlist' as any)
        .delete()
        .eq('listing_id', listingId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast({ title: 'Eliminat din Watchlist' });
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateWatchlistSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      notifyPriceDrop,
      notifyAuctionEnding,
      priceThreshold,
    }: {
      itemId: string;
      notifyPriceDrop?: boolean;
      notifyAuctionEnding?: boolean;
      priceThreshold?: number | null;
    }) => {
      const updateData: any = {};
      if (notifyPriceDrop !== undefined) updateData.notify_price_drop = notifyPriceDrop;
      if (notifyAuctionEnding !== undefined) updateData.notify_auction_ending = notifyAuctionEnding;
      if (priceThreshold !== undefined) updateData.price_threshold = priceThreshold;

      const { error } = await supabase
        .from('watchlist' as any)
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};

export const useIsInWatchlist = (listingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['watchlist-check', listingId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('watchlist' as any)
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!listingId,
  });
};
