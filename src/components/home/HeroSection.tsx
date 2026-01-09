import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-up">
            Buy and sell
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Join millions of people discovering great deals on unique items. 
            From electronics to fashion, find what you're looking for.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 h-14 text-lg rounded-full border-2 focus-visible:ring-0 focus-visible:border-primary"
              />
              <Button 
                type="submit" 
                size="lg" 
                className="absolute right-2 rounded-full px-6"
              >
                Search
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <span>Popular:</span>
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/browse?search=iphone')}>iPhone</Button>
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/browse?search=laptop')}>Laptop</Button>
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/browse?search=nike')}>Nike</Button>
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/browse?search=furniture')}>Furniture</Button>
          </div>
        </div>
      </div>
    </section>
  );
};
