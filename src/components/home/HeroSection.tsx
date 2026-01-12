import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
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

  return (
    <section className="relative bg-background py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          {/* Large Centered Logo - BIGGER */}
          <div className="animate-fade-up flex justify-center">
            <img 
              src={logo} 
              alt="AdiMarket - Buy & Sell Smart" 
              className="h-40 md:h-56 lg:h-72 w-auto drop-shadow-2xl"
            />
          </div>
          
          {/* Buy & Sell Tagline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {t('home.hero.tagline')}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {t('home.hero.subtitle')}
          </p>

          {/* Single Main Search Bar */}
          <form onSubmit={handleSearch} className="animate-fade-up max-w-2xl mx-auto" style={{ animationDelay: '0.25s' }}>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('header.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-card border-border"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 text-lg">
                <Search className="h-5 w-5 mr-2" />
                {t('header.search')}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <span>{t('home.hero.popular')}:</span>
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/browse?search=iphone')}>iPhone</Button>
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/browse?search=laptop')}>Laptop</Button>
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/browse?search=nike')}>Nike</Button>
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/browse?search=furniture')}>{t('home.hero.furniture')}</Button>
          </div>
        </div>
      </div>
    </section>
  );
};
