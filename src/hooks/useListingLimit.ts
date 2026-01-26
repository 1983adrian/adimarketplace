import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useListingLimit = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['listing-limit', user?.id],
    queryFn: async () => {
      if (!user) return { currentCount: 0, maxListings: null, canCreateMore: true };

      // Obține numărul curent de listări active ale utilizatorului
      const { count: currentCount, error: countError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('is_active', true);

      if (countError) throw countError;

      // Obține limita maximă din profil (NULL = nelimitat)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('max_listings')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // NULL înseamnă nelimitat
      const maxListings = profile?.max_listings;
      const activeCount = currentCount || 0;

      // Dacă maxListings este null, poate crea oricâte produse
      const canCreateMore = maxListings === null ? true : activeCount < maxListings;

      return {
        currentCount: activeCount,
        maxListings, // null = nelimitat
        canCreateMore,
        remaining: maxListings === null ? Infinity : maxListings - activeCount,
        isUnlimited: maxListings === null,
      };
    },
    enabled: !!user,
  });
};
