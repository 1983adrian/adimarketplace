import React from 'react';
import { ListingCard } from '@/components/listings/ListingCard';

interface PopularProductsGridProps {
  listings: any[];
  conditionLabels: Record<string, string>;
}

export const PopularProductsGrid: React.FC<PopularProductsGridProps> = ({ listings }) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};
