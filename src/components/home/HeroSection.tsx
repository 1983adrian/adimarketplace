import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Shield, Truck, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Import individual letters
import letterC from '@/assets/letter-c.png';
import letterM from '@/assets/letter-m.png';
import letterA from '@/assets/letter-a.png';
import letterR from '@/assets/letter-r.png';
import letterK from '@/assets/letter-k.png';
import letterE from '@/assets/letter-e.png';
import letterT from '@/assets/letter-t.png';

// CMarket Logo - Each letter as individual image, perfectly aligned
const CMarketLogo: React.FC = () => {
  const letters = [
    { src: letterC, alt: 'C', className: 'h-16 md:h-24 lg:h-32 w-auto -mr-2 md:-mr-3' },
    { src: letterM, alt: 'M', className: 'h-12 md:h-20 lg:h-28 w-auto' },
    { src: letterA, alt: 'a', className: 'h-10 md:h-16 lg:h-24 w-auto' },
    { src: letterR, alt: 'r', className: 'h-10 md:h-16 lg:h-24 w-auto' },
    { src: letterK, alt: 'k', className: 'h-12 md:h-20 lg:h-28 w-auto' },
    { src: letterE, alt: 'e', className: 'h-10 md:h-16 lg:h-24 w-auto' },
    { src: letterT, alt: 't', className: 'h-10 md:h-16 lg:h-24 w-auto' },
  ];

  return (
    <div className="flex items-end justify-center gap-0 animate-fade-up px-4">
      {letters.map((letter, index) => (
        <img
          key={letter.alt}
          src={letter.src}
          alt={letter.alt}
          className={`object-contain drop-shadow-lg transition-transform hover:scale-105 ${letter.className}`}
          style={{ 
            animationDelay: `${index * 0.1}s`,
            filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))'
          }}
        />
      ))}
    </div>
  );
};

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
    { 
      icon: Shield, 
      text: 'Buyer Protection', 
      subtext: 'Plăți securizate',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    { 
      icon: Truck, 
      text: 'Fast Delivery', 
      subtext: 'Livrare cu tracking',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    { 
      icon: Star, 
      text: 'Trusted Sellers', 
      subtext: 'Recenzii verificate',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 relative">
      <div className="max-w-6xl mx-auto text-center space-y-6 md:space-y-8">
          {/* CMarket Logo - Individual Letters */}
          <div className="flex justify-center py-4 md:py-8">
            <CMarketLogo />
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

          {/* Trust Badges - Functional and Interactive */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto pt-6 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            {features.map(({ icon: Icon, text, subtext, color, bgColor }) => (
              <div 
                key={text} 
                className="flex flex-col items-center gap-3 text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className={`p-4 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 md:h-8 md:w-8 ${color}`} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-sm md:text-base text-foreground">{text}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
