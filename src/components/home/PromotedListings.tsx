import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Heart, Sparkles, ShoppingCart, Gavel } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePromotedListings } from '@/hooks/usePromotions';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { cn } from '@/lib/utils';
import { PromotedGrid } from './PromotedGrid';

export const PromotedListings: React.FC = () => {
  const { data: promotedListings, isLoading } = usePromotedListings();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const conditionLabels: Record<string, string> = {
    new: t('condition.new'),
    like_new: t('condition.like_new'),
    good: t('condition.good'),
    fair: t('condition.fair'),
    poor: t('condition.poor'),
  };

  if (isLoading) {
    return (
      <section className="py-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{t('home.featured')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                {t('home.featured')}
                <Crown className="h-5 w-5 text-yellow-500" />
              </h2>
              <p className="text-sm text-muted-foreground">{t('home.hero.subtitle').substring(0, 40)}...</p>
            </div>
          </div>
        </div>

        <PromotedGrid 
          listings={promotedListings.slice(0, 8)} 
          conditionLabels={conditionLabels} 
          formatPrice={formatPrice} 
          t={t}
        />
      </div>
    </section>
  );
};
