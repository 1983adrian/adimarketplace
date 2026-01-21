import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, MapPin, Download, Smartphone, Apple, Share, Plus, Menu, QrCode } from 'lucide-react';
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
import cmarketHero from '@/assets/cmarket-hero.png';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { 
    isInstalled, 
    isStandalone, 
    isIOS, 
    isAndroid, 
    canPrompt, 
    promptInstall 
  } = usePWAInstall();

  const showDownloadButtons = !isStandalone && !isInstalled;

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
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Download App Buttons - positioned above logo */}
          {showDownloadButtons && (
            <div className="flex justify-start md:justify-center mb-2 animate-fade-up">
              <div className="flex items-center gap-2">
                {/* iOS Button */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-1.5 bg-black text-white border-black hover:bg-gray-800 hover:text-white rounded-lg px-3 h-9 shadow-md"
                    >
                      <Apple className="h-4 w-4" />
                      <div className="text-left leading-tight">
                        <span className="text-[8px] block opacity-80">Descarcă pe</span>
                        <span className="text-xs font-semibold -mt-0.5 block">iPhone</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <Apple className="h-5 w-5" />
                        Instalare pe iPhone/iPad
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
                          <span className="flex-1 flex items-center gap-1">Apasă <Share className="h-4 w-4" /> Share în Safari</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
                          <span className="flex-1 flex items-center gap-1">Selectează <Plus className="h-4 w-4" /> "Add to Home Screen"</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">3</div>
                          <span className="flex-1">Confirmă cu "Add"</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Android Button */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white border-green-600 hover:from-green-700 hover:to-green-600 rounded-lg px-3 h-9 shadow-md"
                      onClick={canPrompt ? async () => { await promptInstall(); } : undefined}
                    >
                      <Smartphone className="h-4 w-4" />
                      <div className="text-left leading-tight">
                        <span className="text-[8px] block opacity-80">Descarcă pe</span>
                        <span className="text-xs font-semibold -mt-0.5 block">Android</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  {!canPrompt && (
                    <PopoverContent className="w-72 p-4" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <Smartphone className="h-5 w-5" />
                          Instalare pe Android
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
                            <span className="flex-1 flex items-center gap-1">Apasă <Menu className="h-4 w-4" /> meniul browserului</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
                            <span className="flex-1">"Install app" sau "Add to Home screen"</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">3</div>
                            <span className="flex-1">Confirmă instalarea</span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  )}
                </Popover>

                {/* QR Code Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg px-3 h-9 shadow-md"
                    >
                      <QrCode className="h-4 w-4" />
                      <div className="text-left leading-tight hidden sm:block">
                        <span className="text-[8px] block opacity-80">Scanează</span>
                        <span className="text-xs font-semibold -mt-0.5 block">QR Code</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center flex items-center justify-center gap-2">
                        <QrCode className="h-5 w-5 text-primary" />
                        Descarcă C Market pe Alt Dispozitiv
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg border">
                        <QRCodeSVG 
                          value="https://adimarketplace.lovable.app/install" 
                          size={200}
                          level="H"
                          includeMargin={true}
                          bgColor="#ffffff"
                          fgColor="#1a1a2e"
                        />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Scanează acest cod QR cu camera telefonului tău pentru a deschide C Market
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          Funcționează pe iPhone, Android și orice dispozitiv cu cameră
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Apple className="h-4 w-4" />
                          iPhone
                        </div>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Smartphone className="h-4 w-4" />
                          Android
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

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

          {/* Text Section - directly below logo */}
          <div className="-mt-2 space-y-2">
            {/* Trending Badge */}
            <div className="flex justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <span className="px-4 py-2 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Peste 10,000 produse disponibile
              </span>
            </div>
            
            {/* Subtitle */}
            <div className="space-y-1 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                {t('home.hero.tagline')}
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto">
                {t('home.hero.subtitle')}
              </p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="animate-fade-up mt-3" style={{ animationDelay: '0.4s' }}>
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
