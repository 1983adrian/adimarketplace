import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { useListings } from '@/hooks/useListings';

export const FeaturedListings: React.FC = () => {
  const { data: listings, isLoading } = useListings({ sortBy: 'newest' });

  // Take first 8 listings
  const featuredListings = listings?.slice(0, 8);

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Recently Added</h2>
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/browse">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ListingGrid listings={featuredListings} isLoading={isLoading} />
      </div>
    </section>
  );
};
