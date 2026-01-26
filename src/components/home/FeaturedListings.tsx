import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingCart, Package, Plus, Sparkles, TrendingUp, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/VerifiedBadge';

// Sub-component for favorite button with its own hooks
const FavoriteButton: React.FC<{ listingId: string; userId?: string }> = ({ listingId, userId }) => {
  const { data: isFavorite } = useIsFavorite(listingId, userId);
  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    toggleFavorite.mutate({
      listingId,
      userId,
      isFavorite: !!isFavorite,
    });
  };

  if (!userId) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background",
        isFavorite && "text-destructive"
      )}
      onClick={handleToggleFavorite}
    >
      <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
    </Button>
  );
};

export const FeaturedListings: React.FC = () => {
  const { user } = useAuth();
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

  // Enhanced empty state when no real listings exist
  if (!listings || listings.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('home.featured')}</h2>
              <p className="text-muted-foreground">Descoperă produse unice de la vânzători verificați</p>
            </div>

            {/* Empty State Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-border/50 p-8 md:p-12">
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
              
              <div className="relative text-center space-y-6">
                {/* Icon Animation */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <Store className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent animate-pulse" />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    Marketplace-ul așteaptă primele produse!
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Fii printre primii vânzători și începe să câștigi. Mii de cumpărători așteaptă să descopere produsele tale.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" className="gap-2 gradient-primary hover:opacity-90 transition-opacity shadow-lg">
                    <Link to="/create-listing">
                      <Plus className="h-5 w-5" />
                      Adaugă Primul Tău Produs
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link to="/browse">
                      <TrendingUp className="h-5 w-5" />
                      Explorează Categorii
                    </Link>
                  </Button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-border/50">
                  <div className="flex flex-col items-center gap-2 p-4">
                    <div className="p-2 rounded-lg bg-success/10">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <span className="font-medium text-sm">0% Comision</span>
                    <span className="text-xs text-muted-foreground">Prima lună</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm">Promovare Gratuită</span>
                    <span className="text-xs text-muted-foreground">Primele 5 produse</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Store className="h-5 w-5 text-accent" />
                    </div>
                    <span className="font-medium text-sm">Magazin Personal</span>
                    <span className="text-xs text-muted-foreground">Brand propriu</span>
                  </div>
                </div>
              </div>
            </div>
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
                    <FavoriteButton listingId={listing.id} userId={user?.id} />
                    <Badge className="absolute bottom-2 left-2 bg-secondary text-secondary-foreground">
                      {conditionLabels[listing.condition]}
                    </Badge>
                    {/* Verified Badge for special sellers - bottom right */}
                    <div className="absolute bottom-2 right-2">
                      <VerifiedBadge userId={listing.seller_id} size="sm" showTooltip={true} />
                    </div>
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-lg md:text-xl font-bold text-primary mt-1">
                      {formatPrice(listing.price)}
                    </p>
                    {/* Location removed from homepage cards */}
                    <Button 
                      size="sm" 
                      className="w-full gap-2 mt-auto pt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/checkout?listing=${listing.id}`;
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
