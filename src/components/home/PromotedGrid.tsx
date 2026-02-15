import React from 'react';
import { ListingCard } from '@/components/listings/ListingCard';

interface PromotedGridProps {
  listings: any[];
  conditionLabels: Record<string, string>;
  t: (key: string) => string;
}

export const PromotedGrid: React.FC<PromotedGridProps> = ({ listings }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};
