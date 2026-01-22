import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, MapPin, Smartphone, Apple, Share, Plus, Menu, QrCode, Shield, Truck, CreditCard, Gavel, Users, Star, ChevronRight, ArrowRight } from 'lucide-react';
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
import cmarketHero from '@/assets/cmarket-hero-clean.png';

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

  const benefits = [
    { icon: Shield, title: 'Plăți Sigure', color: 'text-emerald-600 bg-emerald-50' },
    { icon: Truck, title: 'Livrare Rapidă', color: 'text-blue-600 bg-blue-50' },
    { icon: CreditCard, title: 'Comisioane Mici', color: 'text-violet-600 bg-violet-50' },
    { icon: Gavel, title: 'Licitații', color: 'text-orange-600 bg-orange-50' },
    { icon: Users, title: 'Comunitate', color: 'text-pink-600 bg-pink-50' },
    { icon: Star, title: 'Recenzii', color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <section className="relative bg-background">
      {/* Hero Banner - eBay/Amazon Style with seamless image */}
      <div className="relative overflow-hidden">
        {/* Background with hero image integrated seamlessly */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10"
        />
        
        {/* Hero image seamlessly integrated - Reduced size for better mobile/desktop visibility */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-32 md:w-48 lg:w-64 hidden sm:flex items-center justify-center opacity-15 pointer-events-none">
          <img 
            src={cmarketHero} 
            alt="" 
            className="w-full h-auto object-contain mix-blend-multiply"
          />
        </div>
        
        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="max-w-4xl">
            {/* Brand Title - Clean eBay/Amazon style */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={cmarketHero} 
                  alt="Marketplace România" 
                  className="h-16 md:h-20 w-auto object-contain"
                />
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                    Marketplace România
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    #1 Platformă de cumpărături online
                  </p>
                </div>
              </div>
              
              <p className="text-base md:text-lg text-foreground/80 max-w-xl">
                Cumpără și vinde <span className="font-semibold text-primary">produse noi sau second-hand</span> de la mii de vânzători verificați din România.
              </p>
            </div>
            
            {/* CTA Buttons - eBay/Amazon style */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Link to="/browse">
                <Button size="lg" className="h-12 px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg">
                  Cumpără Acum
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="lg" variant="outline" className="h-12 px-6 gap-2 border-2 border-primary text-primary hover:bg-primary/10 font-semibold">
                  Vinde Gratuit
                </Button>
              </Link>
            </div>
            
            {/* App Download Buttons - Clean horizontal style like eMAG */}
            {showDownloadButtons && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground mr-2">Descarcă aplicația:</span>
                
                {/* iOS */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 h-9 px-4 border-border hover:bg-secondary"
                    >
                      <Apple className="h-4 w-4" />
                      iPhone
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <Apple className="h-4 w-4" />
                        Instalare pe iPhone
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
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
                      variant="outline" 
                      size="sm" 
                      className="gap-2 h-9 px-4 border-border hover:bg-secondary"
                      onClick={canPrompt ? async () => { await promptInstall(); } : undefined}
                    >
                      <Smartphone className="h-4 w-4" />
                      Android
                    </Button>
                  </PopoverTrigger>
                  {!canPrompt && (
                    <PopoverContent className="w-64 p-4" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <Smartphone className="h-4 w-4" />
                          Instalare pe Android
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>1. Apasă meniul browserului</p>
                          <p>2. "Install app" sau "Add to Home screen"</p>
                          <p>3. Confirmă instalarea</p>
                        </div>
                      </div>
                    </PopoverContent>
                  )}
                </Popover>

                {/* QR */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9 px-4 border-border hover:bg-secondary">
                      <QrCode className="h-4 w-4" />
                      <span className="hidden sm:inline">Cod QR</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-center">Scanează pentru Descărcare</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="p-4 bg-white rounded-xl border">
                        <QRCodeSVG 
                          value="https://adimarketplace.lovable.app/install" 
                          size={180}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Scanează codul QR cu telefonul pentru a deschide aplicația
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Bar - Amazon/eMAG style horizontal strip */}
      <div className="border-y border-border bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between overflow-x-auto py-3 gap-4 md:gap-6 scrollbar-hide">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <div className={`p-2 rounded-lg ${benefit.color}`}>
                  <benefit.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{benefit.title}</span>
              </div>
            ))}
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
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {listings.slice(0, 15).map((listing) => {
                const primaryImage = listing.listing_images?.find((img: any) => img.is_primary) || listing.listing_images?.[0];
                
                return (
                  <Link key={listing.id} to={`/listing/${listing.id}`}>
                    <Card className="group overflow-hidden cursor-pointer border-border bg-card hover:shadow-lg h-full flex flex-col transition-all duration-200 hover:-translate-y-1">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={primaryImage?.image_url || '/placeholder.svg'}
                          alt={listing.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <Badge 
                          variant="secondary" 
                          className="absolute top-1.5 left-1.5 text-[9px] md:text-[10px] px-1.5 py-0.5"
                        >
                          {conditionLabels[listing.condition]}
                        </Badge>
                        <div className="absolute top-1.5 right-1.5">
                          <VerifiedBadge userId={listing.seller_id} size="sm" showTooltip={true} />
                        </div>
                      </div>
                      <CardContent className="p-2 md:p-3 flex-1 flex flex-col">
                        <h3 className="text-xs md:text-sm font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          {listing.title}
                        </h3>
                        <div className="mt-auto">
                          <span className="text-sm md:text-base font-bold text-primary">
                            {formatPrice(listing.price)}
                          </span>
                        </div>
                        {listing.location && (
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <MapPin className="h-2.5 w-2.5" />
                            <span className="text-[10px] truncate">{listing.location}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
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
