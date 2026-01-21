import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import cmarketHero from '@/assets/cmarket-hero.png';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // Fetch listings for display
  const { data: listings, isLoading } = useQuery({
    queryKey: ['hero-listings'],
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
        .limit(15);

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


  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(220 20% 97%) 0%, hsl(220 20% 98%) 50%, hsl(var(--background)) 100%)' }}>
      {/* Subtle decorative blur elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 py-6 md:py-10 lg:py-14 relative">
        <div className="max-w-6xl mx-auto text-center space-y-6 md:space-y-8">
          
          {/* CMarket Logo - Large, centered, no borders, seamless blend */}
          <div className="flex justify-center animate-fade-up">
            <img 
              src={cmarketHero} 
              alt="CMarket - Marketplace" 
              className="w-full max-w-4xl md:max-w-5xl lg:max-w-6xl h-auto object-contain"
              style={{
                mixBlendMode: 'multiply',
              }}
            />
          </div>

          {/* Trending Badge */}
          <div className="flex justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <span className="px-4 py-2 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Peste 10,000 produse disponibile
            </span>
          </div>
          
          {/* Subtitle */}
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              {t('home.hero.tagline')}
            </p>
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Products Grid - 3 per row on mobile, 5 per row on tablet/desktop */}
          <div className="animate-fade-up pt-4" style={{ animationDelay: '0.4s' }}>
            {isLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                {[...Array(10)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <CardContent className="p-2">
                      <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                {listings.slice(0, 15).map((listing) => {
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
                          <Badge className="absolute bottom-1 left-1 text-[10px] md:text-xs bg-secondary text-secondary-foreground px-1 py-0.5">
                            {conditionLabels[listing.condition]}
                          </Badge>
                          {/* Verified Badge for special sellers - bottom right */}
                          <div className="absolute bottom-1 right-1">
                            <VerifiedBadge userId={listing.seller_id} size="sm" showTooltip={true} />
                          </div>
                        </div>
                        <CardContent className="p-1.5 md:p-2 flex-1 flex flex-col">
                          <h3 className="font-medium text-[10px] md:text-xs line-clamp-1 group-hover:text-primary transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-xs md:text-sm font-bold text-primary mt-0.5">
                            {formatPrice(listing.price)}
                          </p>
                          {listing.location && (
                            <p className="text-[8px] md:text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                              <MapPin className="h-2 w-2 md:h-2.5 md:w-2.5" />
                              <span className="line-clamp-1">{listing.location}</span>
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('browse.noResults')}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
