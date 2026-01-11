import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, MapPin, Heart, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePromotedListings } from '@/hooks/usePromotions';

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const PromotedListings: React.FC = () => {
  const { data: promotedListings, isLoading } = usePromotedListings();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <section className="py-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Featured Listings</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-6 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!promotedListings || promotedListings.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Featured Listings
                <Crown className="h-5 w-5 text-yellow-500" />
              </h2>
              <p className="text-sm text-muted-foreground">Top picks from our sellers</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {promotedListings.slice(0, 10).map((listing) => {
            const primaryImage = listing.listing_images?.find(img => img.is_primary) || listing.listing_images?.[0];
            
            return (
              <Link key={listing.id} to={`/listing/${listing.id}`}>
                <Card className="group overflow-hidden hover-lift cursor-pointer border-primary/20 hover:border-primary/50 bg-background/80 backdrop-blur-sm relative">
                  {/* Featured badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                      <Crown className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={primaryImage?.image_url || '/placeholder.svg'}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Badge className="absolute bottom-2 right-2 bg-secondary text-secondary-foreground">
                      {conditionLabels[listing.condition]}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatPrice(listing.price)}
                    </p>
                    {listing.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
