import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Smartphone, Apple, Share, QrCode, Truck, ChevronRight, ArrowRight, Laptop } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { QRCodeSVG } from 'qrcode.react';
import { MarketplaceBrand } from '@/components/branding/MarketplaceBrand';
import { PopularProductsGrid } from './PopularProductsGrid';


export const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { 
    isInstalled, 
    isStandalone, 
    canPrompt, 
    promptInstall 
  } = usePWAInstall();

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
    new: t('condition.new'),
    like_new: t('condition.like_new'),
    good: t('condition.good'),
    fair: t('condition.fair'),
    poor: t('condition.poor'),
  };


  return (
    <section className="relative bg-background">
      {/* Hero Banner - eBay/Amazon Style with seamless image */}
      <div className="relative overflow-hidden">
        {/* Premium Background Gradient - Professional Marketplace Style */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"
        />
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 py-4 md:py-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Compact Brand Title - Unified Component */}
            <div className="mb-4">
              <MarketplaceBrand size="xl" showTagline linkTo={null} />
            </div>
            
            {/* All Actions in One Compact Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {/* CTA Buttons */}
              <Link to="/browse">
                <Button size="sm" className="h-9 px-4 gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground font-semibold shadow-md text-xs md:text-sm">
                  Cumpără
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="sm" variant="outline" className="h-9 px-4 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs md:text-sm">
                  Vinde
                </Button>
              </Link>
              
              {/* Separator */}
              <div className="hidden md:block h-6 w-px bg-border" />
              
              {/* App Download - Compact Icons in Line */}
              {showDownloadButtons && (
                <>
                  <span className="hidden md:inline text-xs text-muted-foreground">App:</span>
                  
                  {/* iOS */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        size="sm"
                        className="h-9 w-9 p-0 bg-foreground hover:bg-foreground/90 text-background rounded-lg shadow-md"
                      >
                        <Apple className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <Apple className="h-4 w-4" />
                          Instalare pe iPhone
                        </div>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <p>1. Apasă <Share className="h-3 w-3 inline" /> Share în Safari</p>
                          <p>2. Selectează "Add to Home Screen"</p>
                          <p>3. Confirmă cu "Add"</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Android */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        size="sm"
                        className="h-9 w-9 p-0 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white rounded-lg shadow-md"
                        onClick={canPrompt ? async () => { await promptInstall(); } : undefined}
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    {!canPrompt && (
                      <PopoverContent className="w-64 p-3" align="center">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-semibold text-sm">
                            <Smartphone className="h-4 w-4 text-emerald-600" />
                            Instalare pe Android
                          </div>
                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            <p>1. Apasă meniul browserului</p>
                            <p>2. "Install app" sau "Add to Home screen"</p>
                            <p>3. Confirmă instalarea</p>
                          </div>
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>

                  {/* macOS */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        size="sm"
                        className="h-9 w-9 p-0 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 text-white rounded-lg shadow-md"
                      >
                        <Laptop className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <Laptop className="h-4 w-4" />
                          Instalare pe macOS
                        </div>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <p>1. Deschide Chrome sau Safari</p>
                          <p>2. Click pe iconița de instalare sau File → Add to Dock</p>
                          <p>3. Confirmă instalarea</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* QR Code */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm"
                        className="h-9 w-9 p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xs">
                      <DialogHeader>
                        <DialogTitle className="text-center text-base">📱 Scanează pentru App</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col items-center gap-3 py-3">
                        <div className="p-3 bg-white rounded-xl border shadow">
                          <QRCodeSVG 
                            value="https://www.marketplaceromania.com/install-app" 
                            size={150}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Scanează cu camera telefonului
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Products Section - Clean eBay/Amazon grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">Produse Populare</h2>
          </div>
          <Link 
            to="/browse" 
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
          >
            Vezi toate
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
            <PopularProductsGrid listings={listings} conditionLabels={conditionLabels} formatPrice={formatPrice} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nu există produse disponibile momentan.</p>
              <Link to="/sell" className="text-primary hover:underline mt-2 inline-block">
                Fii primul care listează un produs!
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
