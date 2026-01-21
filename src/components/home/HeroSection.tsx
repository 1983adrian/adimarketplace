import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, MapPin, Smartphone, Apple, Share, Plus, Menu, QrCode, Shield, Truck, CreditCard, Gavel, Users, Star } from 'lucide-react';
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
    { icon: Shield, title: 'Tranzacții Sigure', desc: 'Plăți securizate 100%' },
    { icon: Truck, title: 'Livrare Rapidă', desc: 'Parteneri de curierat' },
    { icon: CreditCard, title: 'Comisioane Mici', desc: 'Cele mai mici taxe' },
    { icon: Gavel, title: 'Licitații Live', desc: 'Vinde la cel mai bun preț' },
    { icon: Users, title: 'Cu sau Fără Firmă', desc: 'Pentru toată lumea' },
    { icon: Star, title: 'Recenzii Verificate', desc: 'Feedback real' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-background to-background">
      {/* Subtle decorative blur elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-48 h-48 bg-blue-200/15 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 py-3 relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Download Buttons - Compact at top */}
          {showDownloadButtons && (
            <div className="flex justify-center mb-2 animate-fade-up">
              <div className="flex items-center gap-2">
                {/* iOS Button */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-1.5 bg-black text-white border-black hover:bg-gray-800 hover:text-white rounded-lg px-3 h-8 shadow-md"
                    >
                      <Apple className="h-3.5 w-3.5" />
                      <div className="text-left leading-tight">
                        <span className="text-[7px] block opacity-80">Descarcă pe</span>
                        <span className="text-[10px] font-semibold -mt-0.5 block">iPhone</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4" align="center">
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
                      className="gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white border-green-600 hover:from-green-700 hover:to-green-600 rounded-lg px-3 h-8 shadow-md"
                      onClick={canPrompt ? async () => { await promptInstall(); } : undefined}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <div className="text-left leading-tight">
                        <span className="text-[7px] block opacity-80">Descarcă pe</span>
                        <span className="text-[10px] font-semibold -mt-0.5 block">Android</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  {!canPrompt && (
                    <PopoverContent className="w-72 p-4" align="center">
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
                      className="gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg px-2.5 h-8 shadow-md"
                    >
                      <QrCode className="h-4 w-4" />
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

          {/* Hero Image - Compact, directly below buttons */}
          <div className="flex justify-center animate-fade-up mb-1">
            <img 
              src={cmarketHero} 
              alt="CMarket - Place România" 
              className="w-full max-w-[280px] sm:max-w-xs md:max-w-sm h-auto object-contain"
            />
          </div>

          {/* Platform Description - Compact */}
          <div className="text-center mb-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-1.5">
              <TrendingUp className="h-3 w-3" />
              Marketplace-ul #1 din România
            </div>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Cumpără și vinde inteligent — produse noi sau second-hand. Cu sau fără firmă, licitații live incluse!
            </p>
          </div>

          {/* Benefits Grid - Professional section to fill space */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-2 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 hover:bg-card/80 transition-all"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <benefit.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h4 className="text-[10px] md:text-xs font-semibold text-foreground line-clamp-1">{benefit.title}</h4>
                <p className="text-[8px] md:text-[10px] text-muted-foreground line-clamp-1">{benefit.desc}</p>
              </div>
            ))}
          </div>

          {/* Products Grid - Professional framed presentation */}
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm md:text-base font-semibold text-foreground">🔥 Produse în Trending</h3>
              <Link to="/browse" className="text-xs text-primary hover:underline font-medium">
                Vezi toate →
              </Link>
            </div>
            <div className="bg-card/40 backdrop-blur-sm rounded-xl p-2 md:p-3 border border-border/20">
              {isLoading ? (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {[...Array(15)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-t-lg" />
                      <CardContent className="p-1.5">
                        <div className="h-2.5 bg-muted rounded w-3/4 mb-1" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : listings && listings.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {listings.slice(0, 15).map((listing) => {
                    const primaryImage = listing.listing_images?.find((img: any) => img.is_primary) || listing.listing_images?.[0];
                    
                    return (
                      <Link key={listing.id} to={`/listing/${listing.id}`}>
                        <Card className="group overflow-hidden hover-lift cursor-pointer border-border/50 hover:border-primary/30 h-full flex flex-col bg-card">
                          <div className="relative aspect-square overflow-hidden bg-muted rounded-t-lg">
                            <img
                              src={primaryImage?.image_url || '/placeholder.svg'}
                              alt={listing.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <Badge className="absolute bottom-1 left-1 text-[8px] md:text-[10px] bg-secondary text-secondary-foreground px-1 py-0">
                              {conditionLabels[listing.condition]}
                            </Badge>
                            <div className="absolute bottom-1 right-1">
                              <VerifiedBadge userId={listing.seller_id} size="sm" showTooltip={true} />
                            </div>
                          </div>
                          <CardContent className="p-1 md:p-1.5 flex-1 flex flex-col">
                            <h3 className="font-medium text-[9px] md:text-[11px] line-clamp-1 group-hover:text-primary transition-colors">
                              {listing.title}
                            </h3>
                            <p className="text-[10px] md:text-xs font-bold text-primary mt-0.5">
                              {formatPrice(listing.price)}
                            </p>
                            {listing.location && (
                              <p className="text-[7px] md:text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                <MapPin className="h-2 w-2" />
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
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">{t('browse.noResults')}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
