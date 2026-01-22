import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, MapPin, Smartphone, Apple, Share, Plus, Menu, QrCode, Shield, Truck, CreditCard, Gavel, Users, Star, Sparkles, Crown, Zap } from 'lucide-react';
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
    { icon: Shield, title: 'Tranzacții Sigure', desc: 'Plăți securizate', gradient: 'from-emerald-500 to-green-600' },
    { icon: Truck, title: 'Livrare Rapidă', desc: 'Parteneri curierat', gradient: 'from-blue-500 to-cyan-600' },
    { icon: CreditCard, title: 'Comisioane Mici', desc: 'Taxe minime', gradient: 'from-violet-500 to-purple-600' },
    { icon: Gavel, title: 'Licitații Live', desc: 'Cel mai bun preț', gradient: 'from-orange-500 to-amber-600' },
    { icon: Users, title: 'Pentru Toți', desc: 'Cu sau fără firmă', gradient: 'from-pink-500 to-rose-600' },
    { icon: Star, title: 'Recenzii Pro', desc: 'Feedback real', gradient: 'from-yellow-500 to-orange-600' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Premium decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.03&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 rounded-full blur-3xl translate-y-1/2 pointer-events-none animate-pulse-slow" />
      
      <div className="container mx-auto px-4 py-6 relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Logo & Branding */}
          <div className="flex flex-col items-center mb-4 animate-fade-up">
            <img 
              src={cmarketHero} 
              alt="C Market - Marketplace #1 România" 
              className="w-full max-w-[200px] md:max-w-[260px] h-auto object-contain drop-shadow-2xl"
            />
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1 text-xs font-bold shadow-lg">
                <Crown className="h-3 w-3 mr-1" />
                PRO
              </Badge>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 px-3 py-1 text-xs font-bold shadow-lg">
                <Zap className="h-3 w-3 mr-1" />
                #1 România
              </Badge>
            </div>
          </div>
          
          {/* Download Buttons - PRO Style */}
          {showDownloadButtons && (
            <div className="flex justify-center mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                {/* iOS Button */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      size="sm" 
                      className="gap-2 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 hover:from-slate-700 hover:to-slate-800 rounded-xl px-4 h-12 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      <Apple className="h-5 w-5" />
                      <div className="text-left leading-tight">
                        <span className="text-[8px] block opacity-80 font-medium">Descarcă pe</span>
                        <span className="text-sm font-bold -mt-0.5 block">iPhone</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl" align="center">
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
                      className="gap-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 hover:from-emerald-400 hover:to-green-500 rounded-xl px-4 h-12 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      onClick={canPrompt ? async () => { await promptInstall(); } : undefined}
                    >
                      <Smartphone className="h-5 w-5" />
                      <div className="text-left leading-tight">
                        <span className="text-[8px] block opacity-80 font-medium">Descarcă pe</span>
                        <span className="text-sm font-bold -mt-0.5 block">Android</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  {!canPrompt && (
                    <PopoverContent className="w-72 p-4 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl" align="center">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <Smartphone className="h-5 w-5 text-emerald-500" />
                          Instalare pe Android
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                            <span className="flex-1 flex items-center gap-1">Apasă <Menu className="h-4 w-4" /> meniul browserului</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                            <span className="flex-1">"Install app" sau "Add to Home screen"</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
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
                      className="gap-2 bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 hover:from-violet-400 hover:to-purple-500 rounded-xl px-4 h-12 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      <QrCode className="h-5 w-5" />
                      <span className="text-sm font-bold hidden sm:block">QR</span>
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


          {/* Platform Description - PRO Style */}
          <div className="text-center mb-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
              Cumpără și vinde inteligent — produse noi sau second-hand. 
              <span className="text-amber-400 font-semibold"> Cu sau fără firmă</span>, 
              <span className="text-emerald-400 font-semibold"> licitații live</span> incluse!
            </p>
          </div>

          {/* Benefits Grid - PRO Colorful Cards */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-default"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110`}>
                  <benefit.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h4 className="text-[10px] md:text-xs font-bold text-white line-clamp-1">{benefit.title}</h4>
                <p className="text-[8px] md:text-[10px] text-white/60 line-clamp-1">{benefit.desc}</p>
              </div>
            ))}
          </div>

          {/* Products Grid - PRO Glass Container */}
          <div className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-white">Produse în Trending</h3>
              </div>
              <Link to="/browse" className="flex items-center gap-1 text-xs text-white/80 hover:text-white font-medium bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all">
                Vezi toate
                <Sparkles className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 md:p-4 border border-white/20 shadow-2xl">
              {isLoading ? (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                  {[...Array(15)].map((_, i) => (
                    <Card key={i} className="animate-pulse bg-white/20 border-0">
                      <div className="aspect-square bg-white/30 rounded-t-xl" />
                      <CardContent className="p-2">
                        <div className="h-3 bg-white/30 rounded w-3/4 mb-1" />
                        <div className="h-4 bg-white/30 rounded w-1/2" />
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
                        <Card className="group overflow-hidden cursor-pointer border-0 bg-white shadow-lg hover:shadow-2xl h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl">
                          <div className="relative aspect-square overflow-hidden bg-muted rounded-t-xl">
                            <img
                              src={primaryImage?.image_url || '/placeholder.svg'}
                              alt={listing.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <Badge className="absolute top-1 left-1 text-[8px] md:text-[10px] bg-gradient-to-r from-slate-800 to-slate-700 text-white px-1.5 py-0.5 rounded-md shadow-md">
                              {conditionLabels[listing.condition]}
                            </Badge>
                            <div className="absolute top-1 right-1">
                              <VerifiedBadge userId={listing.seller_id} size="sm" showTooltip={true} />
                            </div>
                          </div>
                          <CardContent className="p-2 flex-1 flex flex-col bg-white">
                            <h3 className="font-semibold text-[10px] md:text-xs text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {listing.title}
                            </h3>
                            <p className="text-xs md:text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-0.5">
                              {formatPrice(listing.price)}
                            </p>
                            {listing.location && (
                              <p className="text-[8px] md:text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="h-2.5 w-2.5" />
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
                  <p className="text-white/60 text-sm">{t('browse.noResults')}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
