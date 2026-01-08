import React from 'react';
import { ListingCard } from './ListingCard';
import { ListingWithImages } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';

interface ListingGridProps {
  listings?: ListingWithImages[];
  isLoading?: boolean;
}

export const ListingGrid: React.FC<ListingGridProps> = ({ listings, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No listings found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};
