import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ListingCard } from './ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingWithImages } from '@/types/database';

interface SimilarListingsProps {
  listingId: string;
  categoryId: string | null;
  sellerId: string;
}

export const SimilarListings: React.FC<SimilarListingsProps> = ({ 
  listingId, 
  categoryId, 
  sellerId 
}) => {
  const { data: listings, isLoading } = useQuery({
    queryKey: ['similar-listings', listingId, categoryId],
    queryFn: async () => {
      // First try to get listings from same category
      let query = supabase
        .from('listings')
        .select(`
          *,
          listing_images (*),
          categories (*)
        `)
        .eq('is_active', true)
        .eq('is_sold', false)
        .neq('id', listingId)
        .neq('seller_id', sellerId)
        .limit(4);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // If not enough results, get more random listings
      if (!data || data.length < 4) {
        const { data: moreData } = await supabase
          .from('listings')
          .select(`
            *,
            listing_images (*),
            categories (*)
          `)
          .eq('is_active', true)
          .eq('is_sold', false)
          .neq('id', listingId)
          .neq('seller_id', sellerId)
          .limit(4 - (data?.length || 0))
          .order('created_at', { ascending: false });

        return [...(data || []), ...(moreData || [])] as ListingWithImages[];
      }

      return data as ListingWithImages[];
    },
    enabled: !!listingId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};
