import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Smartphone, Apple, Share, QrCode, ChevronRight, ArrowRight, Laptop } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { QRCodeSVG } from 'qrcode.react';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';
import { PopularProductsGrid } from './PopularProductsGrid';
import { useHomepageContent, usePlatformSettings } from '@/hooks/useAdminSettings';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { 
    isInstalled, 
    isStandalone, 
    canPrompt, 
    promptInstall 
  } = usePWAInstall();

  // Fetch homepage content from Admin settings
  const { data: homepageData } = useHomepageContent();
  const { data: platformSettings } = usePlatformSettings();
  
  // Extract hero content from database
  const heroContent = homepageData?.find(h => h.section_key === 'hero');
  const sectionsConfig = homepageData?.find(h => h.section_key === 'sections');
  
  // Parse sections config
  const sections = sectionsConfig?.description ? (() => {
    try {
      return JSON.parse(sectionsConfig.description);
    } catch {
      return {};
    }
  })() : {};
  
  // Get customizable content with fallbacks
  const heroTitle = heroContent?.title || 'Marketplace România®';
  const heroSubtitle = heroContent?.subtitle || 'Cumpără și Vinde Smart';
  const ctaText = heroContent?.button_text || 'Cumpără';
  const ctaLink = heroContent?.button_url || '/browse';
  const productsTitle = sections?.featuredTitle || 'Produse Populare';
  const showDownloadButtons = !isStandalone && !isInstalled;

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
    new: t('condition.new') as string,
    like_new: t('condition.like_new') as string,
    good: t('condition.good') as string,
    fair: t('condition.fair') as string,
    poor: t('condition.poor') as string,
  };


  return (
    <section className="relative bg-white dark:bg-gray-950">
      {/* Hero Banner - Clean white background */}
      <div className="relative">
        <div className="container mx-auto px-0 sm:px-4 py-1 md:py-2 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Compact Brand Title - Unified Component */}
            <div className="-mb-2">
              <MarketplaceBrand size="xl" showTagline linkTo={null} />
            </div>
          </div>
        </div>
      </div>


      {/* Products Section - Clean eBay/Amazon grid */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">{productsTitle}</h2>
          </div>
          <Link 
            to="/browse" 
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
          >
            {t('common.viewAll')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {[...Array(15)].map((_, i) => (
                <Card key={i} className="animate-pulse border-border">
                  <div className="aspect-square bg-muted rounded-t-lg" />
                  <CardContent className="p-2 md:p-3">
                    <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <PopularProductsGrid listings={listings} conditionLabels={conditionLabels} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('home.noProducts')}</p>
              <Link to="/sell" className="text-primary hover:underline mt-2 inline-block">
                {t('home.beFirstToList')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
