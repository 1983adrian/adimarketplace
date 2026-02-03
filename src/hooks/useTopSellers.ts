import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TopSeller {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  store_name: string | null;
  is_verified: boolean | null;
  total_sales: number;
  avg_rating: number;
}

export const useTopSellers = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-sellers', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_top_sellers', { limit_count: limit });
      
      if (error) {
        console.error('Error fetching top sellers:', error);
        return [];
      }
      
      return (data || []) as TopSeller[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useIsTopSeller = (userId?: string) => {
  return useQuery({
    queryKey: ['is-top-seller', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .rpc('is_top_seller', { check_user_id: userId });
      
      if (error) {
        console.error('Error checking top seller status:', error);
        return false;
      }
      
      return data === true;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
