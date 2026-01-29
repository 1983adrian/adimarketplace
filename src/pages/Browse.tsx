import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, MapPin, Heart, Package, ShoppingCart, Store, User } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCategories } from '@/hooks/useCategories';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VerifiedBadge } from '@/components/VerifiedBadge';
const Browse = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  const [locationFilter, setLocationFilter] = useState('');
  const { data: categories } = useCategories();

  const selectedCategory = searchParams.get('category') || '';

  // Fetch real listings from database
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['browse-listings', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select(`
          *,
          listing_images (
            id,
            image_url,
            is_primary,
            sort_order
          ),
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .eq('is_sold', false);

      if (selectedCategory) {
        const category = categories?.find(c => c.slug === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch sellers/profiles for search
  const { data: sellers = [], isLoading: sellersLoading } = useQuery({
    queryKey: ['browse-sellers', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      // Use secure public view that only exposes safe columns
      const { data, error } = await supabase
        .from('public_seller_profiles')
        .select('user_id, display_name, username, store_name, avatar_url, bio, location, is_verified, is_seller')
        .or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,store_name.ilike.%${searchQuery}%`)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!searchQuery && searchQuery.length >= 2,
  });

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = !searchQuery || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.description && listing.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    const matchesCondition = !selectedCondition || listing.condition === selectedCondition;
    const matchesLocation = !locationFilter || 
      (listing.location && listing.location.toLowerCase().includes(locationFilter.toLowerCase()));
    return matchesSearch && matchesPrice && matchesCondition && matchesLocation;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'newest': 
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (searchQuery) prev.set('search', searchQuery);
      else prev.delete('search');
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 1000000]);
    setSelectedCondition('');
    setLocationFilter('');
    setSortBy('newest');
    setSearchParams({});
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">{t('browse.category')}</Label>
        <Select 
          value={selectedCategory || "all"} 
          onValueChange={(value) => setSearchParams(prev => { 
            if (value && value !== "all") prev.set('category', value); 
            else prev.delete('category'); 
            return prev; 
          })}
        >
          <SelectTrigger><SelectValue placeholder={t('browse.allCategories')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('browse.allCategories')}</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label className="mb-2 block">{t('browse.priceRange')}: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</Label>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={1000000} step={100} className="mt-4" />
      </div>
      
      <div>
        <Label className="mb-2 block">{t('browse.condition')}</Label>
        <Select value={selectedCondition || "any"} onValueChange={(value) => setSelectedCondition(value === "any" ? "" : value)}>
          <SelectTrigger><SelectValue placeholder={t('browse.anyCondition')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('browse.anyCondition')}</SelectItem>
            <SelectItem value="new">{t('condition.new')}</SelectItem>
            <SelectItem value="like_new">{t('condition.like_new')}</SelectItem>
            <SelectItem value="good">{t('condition.good')}</SelectItem>
            <SelectItem value="fair">{t('condition.fair')}</SelectItem>
            <SelectItem value="poor">{t('condition.poor')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">{t('settings.location')}</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="London, Manchester..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="h-4 w-4 mr-2" /> {t('browse.clearFilters')}
      </Button>
    </div>
  );

  const renderListingsGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (sortedListings.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-lg">{t('browse.noListings')}</p>
          <Button variant="link" onClick={clearFilters}>{t('browse.clearFilters')}</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {sortedListings.map((listing) => {
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Badge className="absolute bottom-2 left-2 bg-secondary text-secondary-foreground">
                    {t(`condition.${listing.condition}`)}
                  </Badge>
                </div>
                <CardContent className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-lg md:text-xl font-bold text-primary mt-1">
                    {formatPrice(listing.price, ((listing as any).price_currency || 'GBP') as any)}
                  </p>
                  {listing.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />{listing.location}
                    </p>
                  )}
                  <Button 
                    size="sm" 
                    className="w-full gap-2 mt-auto pt-2"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/checkout?listing=${listing.id}`;
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {t('listing.buyNow')}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder={t('browse.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Button type="submit">{t('common.search')}</Button>
          </form>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('browse.newest')}</SelectItem>
                <SelectItem value="price_asc">{t('browse.priceLow')}</SelectItem>
                <SelectItem value="price_desc">{t('browse.priceHigh')}</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden"><Filter className="h-4 w-4 mr-2" /> {t('browse.filters')}</Button>
              </SheetTrigger>
              <SheetContent><SheetHeader><SheetTitle>{t('browse.filters')}</SheetTitle></SheetHeader><div className="mt-6"><FiltersContent /></div></SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4">{t('browse.filters')}</h3>
              <FiltersContent />
            </div>
          </aside>

          <div className="flex-1">
            {/* Show tabs when searching to include sellers */}
            {searchQuery && searchQuery.length >= 2 ? (
              <Tabs defaultValue="listings" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="listings" className="gap-2">
                    <Package className="h-4 w-4" />
                    Produse ({sortedListings.length})
                  </TabsTrigger>
                  <TabsTrigger value="sellers" className="gap-2">
                    <Store className="h-4 w-4" />
                    Vânzători ({sellers.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="listings">
                  {renderListingsGrid()}
                </TabsContent>

                <TabsContent value="sellers">
                  {sellersLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-muted" />
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                              <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : sellers.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground text-lg">Niciun vânzător găsit pentru "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sellers.map((seller) => (
                        <Link key={seller.user_id} to={`/seller/${seller.user_id}`}>
                          <Card className="group hover:border-primary/30 transition-colors cursor-pointer">
                            <CardContent className="p-4 flex items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={seller.avatar_url || undefined} />
                                <AvatarFallback className="text-lg">
                                  {(seller.display_name || seller.username || 'V')[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                    {seller.store_name || seller.display_name || seller.username || 'Vânzător'}
                                  </h3>
                                  <VerifiedBadge userId={seller.user_id} size="sm" />
                                  {seller.is_verified && (
                                    <Badge variant="secondary" className="text-xs">Verificat</Badge>
                                  )}
                                </div>
                                {seller.bio && (
                                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{seller.bio}</p>
                                )}
                                {seller.location && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />{seller.location}
                                  </p>
                                )}
                              </div>
                              <Button variant="outline" size="sm" className="shrink-0">
                                <Store className="h-4 w-4 mr-1" />
                                Magazin
                              </Button>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">{sortedListings.length} {t('browse.itemsFound')}</p>
                {renderListingsGrid()}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Browse;
