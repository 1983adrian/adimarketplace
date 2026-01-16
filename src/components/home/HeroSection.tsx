import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Shield, Truck, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo.jpeg';

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
      
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-28 relative">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Logo & Brand */}
          <div className="animate-fade-up flex flex-col items-center gap-4">
            <img 
              src={logo} 
              alt="AdiMarket" 
              className="h-20 md:h-28 lg:h-36 w-auto drop-shadow-lg rounded-2xl"
            />
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Over 10,000 items
              </span>
            </div>
          </div>
          
          {/* Headline */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-display">
              {t('home.hero.tagline')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Search Bar - Amazon/eBay Style */}
          <form 
            onSubmit={handleSearch} 
            className="animate-fade-up max-w-3xl mx-auto" 
            style={{ animationDelay: '0.2s' }}
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
          <div className="flex flex-wrap justify-center gap-2 animate-fade-up" style={{ animationDelay: '0.3s' }}>
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
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
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
