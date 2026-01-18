import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Heart, ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const FeaturedListings: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  // Fetch real listings from database
  const { data: listings, isLoading } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images (
            id,
            image_url,
            is_primary,
            sort_order
          )
        `)
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });

  const conditionLabels: Record<string, string> = {
    new: t('condition.new'),
    like_new: t('condition.like_new'),
    good: t('condition.good'),
    fair: t('condition.fair'),
    poor: t('condition.poor'),
  };

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">{t('home.featured')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-3">
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

  // Don't show section if no real listings
  if (!listings || listings.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">{t('home.featured')}</h2>
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/browse">
                {t('common.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">Nu există produse încă</p>
            <p className="text-muted-foreground text-sm mt-1">Fii primul care adaugă un produs!</p>
            <Button asChild className="mt-4">
              <Link to="/create-listing">Adaugă Produs</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{t('home.featured')}</h2>
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/browse">
              {t('common.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {listings.map((listing) => {
            const primaryImage = listing.listing_images?.find((img: any) => img.is_primary) || listing.listing_images?.[0];
            
            return (
              <Link key={listing.id} to={`/listing/${listing.id}`}>
                <Card className="group overflow-hidden hover-lift cursor-pointer border-border/50 hover:border-primary/30 h-full flex flex-col">
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
                    <Badge className="absolute bottom-2 left-2 bg-secondary text-secondary-foreground">
                      {conditionLabels[listing.condition]}
                    </Badge>
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-lg md:text-xl font-bold text-primary mt-1">
                      {formatPrice(listing.price)}
                    </p>
                    {listing.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </p>
                    )}
                    <Button 
                      size="sm" 
                      className="w-full gap-2 mt-auto pt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/checkout/${listing.id}`;
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {t('listing.buyNow')}
                    </Button>
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
