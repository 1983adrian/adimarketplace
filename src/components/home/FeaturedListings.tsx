import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sampleListings } from '@/data/sampleListings';

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const FeaturedListings: React.FC = () => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {sampleListings.slice(0, 8).map((listing) => (
            <Link key={listing.id} to={`/listing/${listing.id}`}>
              <Card className="group overflow-hidden hover-lift cursor-pointer border-border/50 hover:border-primary/30">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Badge className="absolute bottom-2 left-2 bg-secondary text-secondary-foreground">
                    {conditionLabels[listing.condition]}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatPrice(listing.price)}
                  </p>
                  {listing.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                      <MapPin className="h-3 w-3" />
                      {listing.location}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
