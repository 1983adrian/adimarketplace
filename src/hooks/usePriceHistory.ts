import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PriceHistoryItem {
  id: string;
  listing_id: string;
  price: number;
  price_type: 'bid' | 'final' | 'buy_now';
  recorded_at: string;
}

// Get price history for a specific listing
export const useListingPriceHistory = (listingId: string) => {
  return useQuery({
    queryKey: ['price-history', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_history' as any)
        .select('*')
        .eq('listing_id', listingId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as PriceHistoryItem[];
    },
    enabled: !!listingId,
  });
};

// Get average final prices for similar listings in a category
export const useCategoryPriceStats = (categoryId: string | null) => {
  return useQuery({
    queryKey: ['category-price-stats', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;

      // Get listings in same category that are sold
      const { data: listings, error } = await supabase
        .from('listings')
        .select('price, listing_type')
        .eq('category_id', categoryId)
        .eq('is_sold', true)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!listings || listings.length === 0) return null;

      const prices = listings.map(l => Number(l.price));
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      return {
        averagePrice: avgPrice,
        minPrice,
        maxPrice,
        sampleSize: listings.length,
      };
    },
    enabled: !!categoryId,
  });
};

// Get recent auction final prices
export const useRecentAuctionPrices = (categoryId?: string) => {
  return useQuery({
    queryKey: ['recent-auction-prices', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('price_history' as any)
        .select(`
          *,
          listings!inner (
            id, title, category_id,
            listing_images (image_url, is_primary)
          )
        `)
        .eq('price_type', 'final')
        .order('recorded_at', { ascending: false })
        .limit(20);

      if (categoryId) {
        query = query.eq('listings.category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });
};
