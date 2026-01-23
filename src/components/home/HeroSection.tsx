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
        {/* Premium Background Gradient - Professional Marketplace Style */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"
        />
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 py-10 md:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Brand Title - Premium eBay/Amazon Professional Style */}
            <div className="mb-8">
              {/* Main Title - Professional Marketplace Typography */}
              <div className="mb-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent drop-shadow-sm">
                    Market
                  </span>
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    place
                  </span>
                  <span className="text-foreground ml-2">România</span>
                </h1>
                
                {/* Premium Tagline */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="h-[2px] w-8 md:w-12 bg-gradient-to-r from-transparent to-primary rounded-full" />
                  <p className="text-xs md:text-sm lg:text-base font-semibold text-muted-foreground uppercase tracking-widest">
                    Cumpără • Vinde • Licitează
                  </p>
                  <div className="h-[2px] w-8 md:w-12 bg-gradient-to-l from-transparent to-primary rounded-full" />
                </div>
              </div>
              
              <p className="text-base md:text-lg lg:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                <span className="font-bold text-primary">Cumpără sau vinde</span> produse noi și second-hand, 
                <span className="font-bold text-amber-500"> licitează</span> pentru oferte unice sau 
                <span className="font-bold text-emerald-500"> pune la licitație</span> propriile produse. 
                Mii de vânzători verificați din România te așteaptă!
              </p>
            </div>
            
            {/* CTA Buttons - eBay/Amazon style - Centered */}
            <div className="flex flex-wrap gap-3 mb-6 justify-center">
              <Link to="/browse">
                <Button size="lg" className="h-12 px-8 gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                  Cumpără Acum
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="lg" variant="outline" className="h-12 px-8 gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold transition-all duration-300 hover:-translate-y-0.5">
                  Vinde Gratuit
                </Button>
              </Link>
            </div>
            
            {/* App Download Buttons - Premium visible style - Centered */}
            {showDownloadButtons && (
              <div className="flex flex-col items-center gap-4 mt-8">
                <span className="text-sm font-medium text-foreground">📱 Descarcă aplicația:</span>
                
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {/* iOS - Premium Black Style like App Store */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        size="lg"
                        className="gap-3 h-14 px-6 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <Apple className="h-6 w-6" />
                        <div className="text-left">
                          <div className="text-[10px] opacity-80">Descarcă pe</div>
                          <div className="text-sm font-bold">iPhone</div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4" align="center">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 font-semibold text-base">
                          <Apple className="h-5 w-5" />
                          Instalare pe iPhone
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                            Apasă <Share className="h-4 w-4 inline text-primary" /> Share în Safari
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                            Selectează "Add to Home Screen"
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                            Confirmă cu "Add"
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Android - Premium Green Style like Play Store */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        size="lg"
                        className="gap-3 h-14 px-6 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                        onClick={canPrompt ? async () => { await promptInstall(); } : undefined}
                      >
                        <Smartphone className="h-6 w-6" />
                        <div className="text-left">
                          <div className="text-[10px] opacity-80">Disponibil pe</div>
                          <div className="text-sm font-bold">Android</div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    {!canPrompt && (
                      <PopoverContent className="w-72 p-4" align="center">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 font-semibold text-base">
                            <Smartphone className="h-5 w-5 text-emerald-600" />
                            Instalare pe Android
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <span className="bg-emerald-500/10 text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                              Apasă meniul browserului
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="bg-emerald-500/10 text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                              "Install app" sau "Add to Home screen"
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="bg-emerald-500/10 text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                              Confirmă instalarea
                            </p>
                          </div>
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>

                  {/* QR Code - Premium Blue Style */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg"
                        className="gap-3 h-14 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <QrCode className="h-6 w-6" />
                        <div className="text-left">
                          <div className="text-[10px] opacity-80">Scanează</div>
                          <div className="text-sm font-bold">Cod QR</div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="text-center text-lg">📱 Scanează pentru Descărcare</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col items-center gap-4 py-4">
                        <div className="p-4 bg-white rounded-2xl border-2 border-primary/20 shadow-lg">
                          <QRCodeSVG 
                            value="https://adimarketplace.lovable.app/install" 
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          Scanează codul QR cu camera telefonului pentru a deschide aplicația
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                        <div className="absolute top-1.5 left-1.5">
                          <Badge 
                            variant="secondary" 
                            className="text-[9px] md:text-[10px] px-1.5 py-0.5"
                          >
                            {conditionLabels[listing.condition]}
                          </Badge>
                        </div>
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
