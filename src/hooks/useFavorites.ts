import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Favorite, ListingWithImages } from '@/types/database';

export const useFavorites = (userId?: string) => {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select(`*, listings (*, listing_images (*), categories (*))`)
        .eq('user_id', userId);
      if (error) throw error;
      return data as unknown as (Favorite & { listings: ListingWithImages })[];
    },
    enabled: !!userId,
  });
};

export const useIsFavorite = (listingId: string, userId?: string) => {
  return useQuery({
    queryKey: ['favorite', listingId, userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!userId && !!listingId,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, userId, isFavorite }: { listingId: string; userId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        const { error } = await supabase.from('favorites').delete().eq('listing_id', listingId).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('favorites').insert({ listing_id: listingId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['favorite', variables.listingId, variables.userId] });
    },
  });
};
