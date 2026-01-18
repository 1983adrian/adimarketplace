import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Shield, Truck, Star, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@/assets/marketplace-hero.jpeg';

// MarketPlace colorful title component
const MarketPlaceTitle: React.FC = () => (
  <div className="flex items-center justify-center gap-2 md:gap-4 animate-fade-up">
    {/* Shopping Cart Icon */}
    <ShoppingCart className="h-10 w-10 md:h-16 md:w-16 lg:h-20 lg:w-20 text-primary" />
    
    {/* Colorful MarketPlace Text */}
    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight font-display select-none">
      <span className="text-[hsl(220,90%,50%)]">M</span>
      <span className="text-[hsl(220,90%,50%)]">a</span>
      <span className="text-[hsl(220,90%,50%)]">r</span>
      <span className="text-[hsl(220,90%,50%)]">k</span>
      <span className="text-[hsl(220,90%,50%)]">e</span>
      <span className="text-[hsl(220,90%,50%)]">t</span>
      <span className="text-[hsl(0,80%,50%)]">P</span>
      <span className="text-[hsl(45,100%,50%)]">l</span>
      <span className="text-[hsl(45,100%,50%)]">a</span>
      <span className="text-[hsl(160,84%,39%)]">c</span>
      <span className="text-[hsl(160,84%,39%)]">e</span>
    </h1>
    
    {/* Shopping Basket Icon */}
    <div className="relative">
      <svg className="h-10 w-10 md:h-16 md:w-16 lg:h-20 lg:w-20" viewBox="0 0 64 64" fill="none">
        <path d="M8 24h48l-6 28H14L8 24z" fill="hsl(45, 100%, 50%)" />
        <path d="M20 24V16a12 12 0 0124 0v8" stroke="hsl(220, 90%, 50%)" strokeWidth="4" fill="none" />
        <circle cx="20" cy="56" r="4" fill="hsl(0, 80%, 50%)" />
        <circle cx="44" cy="56" r="4" fill="hsl(160, 84%, 39%)" />
      </svg>
    </div>
  </div>
);

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    { icon: Shield, text: 'Buyer Protection', subtext: 'Secure payments' },
    { icon: Truck, text: 'Fast Delivery', subtext: 'Tracked shipping' },
    { icon: Star, text: 'Trusted Sellers', subtext: 'Verified reviews' },
  ];

  return (
    <section className="relative bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 relative">
        <div className="max-w-6xl mx-auto text-center space-y-6 md:space-y-8">
          {/* Large Colorful MarketPlace Title - Centered, no borders */}
          <MarketPlaceTitle />

          {/* Hero Image - Below the title */}
          <div className="animate-fade-up flex justify-center" style={{ animationDelay: '0.1s' }}>
            <img 
              src={heroImage} 
              alt="MarketPlace Products" 
              className="w-full max-w-4xl h-auto object-contain"
              style={{
                mixBlendMode: 'multiply',
                filter: 'drop-shadow(0 0 0 transparent)',
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

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch} 
            className="animate-fade-up max-w-3xl mx-auto" 
            style={{ animationDelay: '0.4s' }}
          >
            <div className="relative flex shadow-card-hover rounded-xl overflow-hidden bg-card border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('header.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 md:h-16 text-base md:text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 md:h-16 px-6 md:px-10 rounded-none text-base md:text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                <Search className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">{t('header.search')}</span>
              </Button>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <span className="text-sm text-muted-foreground">{t('home.hero.popular')}:</span>
            {['iPhone 15', 'MacBook', 'Nike Air Max', 'PlayStation 5', 'Samsung TV'].map((term) => (
              <Button 
                key={term}
                variant="outline" 
                size="sm"
                className="rounded-full h-8 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => navigate(`/browse?search=${term}`)}
              >
                {term}
              </Button>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-6 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            {features.map(({ icon: Icon, text, subtext }) => (
              <div key={text} className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{text}</p>
                  <p className="text-xs text-muted-foreground hidden md:block">{subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
