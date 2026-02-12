import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Shield, Star, Gavel, CheckCircle, ShoppingCart, Banknote, TrendingUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';

import { StarRating } from '@/components/reviews/StarRating';
import { SimilarListings } from '@/components/listings/SimilarListings';
import { AuctionBidding } from '@/components/listings/AuctionBidding';
import { CODBadge } from '@/components/listings/CODBadge';
import { ShareListingDialog } from '@/components/listings/ShareListingDialog';
import { ReportListingDialog } from '@/components/listings/ReportListingDialog';
import { VariantSelector } from '@/components/listings/VariantSelector';
import { SEOHead } from '@/components/seo/SEOHead';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSellerStats } from '@/hooks/useReviews';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { format } from 'date-fns';
import { VerifiedBadge } from '@/components/VerifiedBadge';

const conditionLabels: Record<string, string> = {
  new: 'Nou',
  like_new: 'Ca Nou',
  good: 'Bună',
  fair: 'Acceptabilă',
  poor: 'Uzată',
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const { playFavoriteSound } = useNotificationSound();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { data: favorites } = useFavorites(user?.id);
  const toggleFavorite = useToggleFavorite();
  
  const isInCart = items.some(item => item.id === id);

  // Fetch listing from database
  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images (*),
          categories (*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      
      // Fetch seller profile using secure public view (only safe columns exposed)
      const { data: profile } = await supabase
        .from('public_seller_profiles')
        .select('*')
        .eq('user_id', data.seller_id)
        .maybeSingle();
        
      return { ...data, seller_profile: profile };
    },
    enabled: !!id,
  });

  const { data: sellerStats } = useSellerStats(listing?.seller_id);
  
  const isFavorite = favorites?.some(f => f.listing_id === id) || false;

  const handleFavoriteToggle = () => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to be logged in to save favorites', variant: 'destructive' });
      navigate('/login');
      return;
    }
    if (id) {
      toggleFavorite.mutate({ listingId: id, userId: user.id, isFavorite }, {
        onSuccess: () => {
          // Play favorite sound when adding to favorites
          if (!isFavorite) {
            playFavoriteSound();
          }
          toast({
            title: isFavorite ? "Eliminat din favorite" : "❤️ Adăugat la favorite",
            description: isFavorite 
              ? "Produsul a fost eliminat din lista ta de favorite."
              : "Produsul a fost salvat în favorite.",
          });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Button asChild><Link to="/browse">Browse Listings</Link></Button>
        </div>
      </Layout>
    );
  }

  const handleContact = () => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to be logged in to message sellers', variant: 'destructive' });
      navigate('/login');
      return;
    }
    navigate(`/messages?listing=${listing.id}`);
  };

  const handleAddToCart = () => {
    if (listing.is_sold) {
      toast({ title: 'Produs indisponibil', description: 'Acest produs a fost deja vândut.', variant: 'destructive' });
      return;
    }
    
    // Validate variant selection
    const hasSizes = listing.sizes && listing.sizes.length > 0;
    const hasColors = listing.colors && listing.colors.length > 0;
    
    if (hasSizes && !selectedSize) {
      toast({ title: 'Selectează mărimea', description: 'Te rugăm să alegi o mărime înainte de a adăuga în coș.', variant: 'destructive' });
      return;
    }
    
    if (hasColors && !selectedColor) {
      toast({ title: 'Selectează culoarea', description: 'Te rugăm să alegi o culoare înainte de a adăuga în coș.', variant: 'destructive' });
      return;
    }
    
    const primaryImg = listing.listing_images?.[0]?.image_url || '/placeholder.svg';
    addItem({
      id: listing.id,
      title: listing.title,
      price: listing.buy_now_price || listing.price,
      image_url: primaryImg,
      seller_id: listing.seller_id,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
    });
    
    toast({
      title: "Adăugat în coș",
      description: `${listing.title}${selectedSize ? ` - Mărime: ${selectedSize}` : ''}${selectedColor ? ` - Culoare: ${selectedColor}` : ''}`,
    });
  };

  // Validate if user can buy (variant selection required)
  const hasSizes = listing.sizes && listing.sizes.length > 0;
  const hasColors = listing.colors && listing.colors.length > 0;
  const needsVariantSelection = hasSizes || hasColors;
  const canBuy = !needsVariantSelection || ((!hasSizes || selectedSize) && (!hasColors || selectedColor));

  const images = listing.listing_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
  const primaryImage = images.find((img: any) => img.is_primary)?.image_url || images[0]?.image_url;
  const sellerProfile = listing.seller_profile;
  const sellerName = (sellerProfile as any)?.short_id ? `#${(sellerProfile as any).short_id}` : 'Vânzător';
  const isAuction = listing.listing_type === 'auction' || listing.listing_type === 'both';
  const isBuyNow = listing.listing_type === 'buy_now' || listing.listing_type === 'both';
  const isVerifiedSeller = sellerProfile?.is_verified;

  // SEO Data Preparation
  const seoPrice = listing.buy_now_price || listing.price;
  const seoCurrency = listing.price_currency || 'RON';
  const seoAvailability = listing.is_sold ? 'OutOfStock' : 'InStock';
  const seoUrl = `https://www.marketplaceromania.com/listing/${listing.id}`;
  const seoImage = primaryImage || 'https://www.marketplaceromania.com/og-image.png';

  return (
    <Layout>
      {/* Product SEO Schema */}
      <SEOHead
        title={listing.title}
        description={listing.description?.slice(0, 155) || `${listing.title} - Cumpără acum pe Marketplace România`}
        image={seoImage}
        url={seoUrl}
        type="product"
        price={seoPrice}
        currency={seoCurrency}
        availability={seoAvailability as 'InStock' | 'OutOfStock' | 'PreOrder'}
        rating={sellerStats?.average_rating}
        reviewCount={sellerStats?.total_reviews}
        isAuction={isAuction}
        auctionEndDate={listing.auction_end_date}
        startingBid={listing.starting_bid}
      />
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <Button variant="ghost" className="mb-3 md:mb-6 h-8 md:h-10 text-sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Înapoi
        </Button>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Gallery - eBay-style compact on mobile */}
          <div className="space-y-1.5 md:space-y-3">
            {/* Main Image - Compact on mobile, full on desktop */}
            <div className="relative rounded-lg overflow-hidden bg-muted md:aspect-square">
              <img 
                src={images[selectedImage]?.image_url || primaryImage || '/placeholder.svg'} 
                alt={listing.title} 
                className="w-full object-contain md:object-cover h-[150px] sm:h-[200px] md:h-full" 
              />
            </div>
            {/* Thumbnail Gallery - Smaller on mobile */}
            {images.length > 1 && (
              <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 px-1">
                {images.map((img: any, index: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-md md:rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImage ? 'border-primary' : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Info */}
          <div className="space-y-2 md:space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1 md:mb-3">
                <Badge>{conditionLabels[listing.condition]}</Badge>
                {listing.categories && (
                  <Badge variant="outline">{listing.categories.name}</Badge>
                )}
                {isAuction && (
                  <Badge variant="secondary" className="gap-1">
                    <Gavel className="h-3 w-3" />
                    Licitație
                  </Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2">{listing.title}</h1>
            {isBuyNow && (
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                  {formatPrice(listing.buy_now_price || listing.price)}
                </p>
                {listing.shipping_cost > 0 && (
                  <p className="text-sm text-destructive font-medium">
                    + {formatPrice(listing.shipping_cost)} livrare
                  </p>
                )}
                {/* COD Badge */}
                {(listing as any).cod_enabled && (
                  <div className="pt-2">
                    <CODBadge
                      enabled={(listing as any).cod_enabled}
                      productPrice={listing.buy_now_price || listing.price}
                      feePercentage={(listing as any).cod_fee_percentage}
                      fixedFee={(listing as any).cod_fixed_fee}
                      transportFee={(listing as any).cod_transport_fee}
                      showDetails={true}
                      size="md"
                    />
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Stock quantity visible to buyers */}
            {listing.quantity && listing.quantity > 1 && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> {listing.quantity} bucăți în stoc
              </p>
            )}
            {listing.quantity === 1 && (
              <p className="text-sm text-orange-600 font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Ultimul produs disponibil!
              </p>
            )}


            {/* Variant Selector for Sizes and Colors */}
            {needsVariantSelection && (
              <VariantSelector
                sizes={listing.sizes}
                colors={listing.colors}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={setSelectedSize}
                onColorChange={setSelectedColor}
                quantity={listing.quantity}
              />
            )}

            {/* Auction Section */}
            {isAuction && listing.auction_end_date && (
              <AuctionBidding
                listingId={listing.id}
                startingBid={listing.starting_bid || listing.price}
                reservePrice={listing.reserve_price}
                buyNowPrice={listing.buy_now_price}
                auctionEndDate={listing.auction_end_date}
                bidIncrement={listing.bid_increment || 1}
                sellerId={listing.seller_id}
              />
            )}

            {/* Buy Now Button - for buy_now or both listings */}
            {isBuyNow && (
              <div className="space-y-3 mb-4">
                <Button 
                  className="w-full gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all" 
                  size="lg"
                  onClick={() => {
                    if (!canBuy) {
                      toast({ 
                        title: 'Selectează opțiunile', 
                        description: 'Te rugăm să alegi mărimea și/sau culoarea înainte de a cumpăra.', 
                        variant: 'destructive' 
                      });
                      return;
                    }
                    // Include selected variants in URL
                    const params = new URLSearchParams({ listing: listing.id });
                    if (selectedSize) params.set('size', selectedSize);
                    if (selectedColor) params.set('color', selectedColor);
                    navigate(`/checkout?${params.toString()}`);
                  }}
                  disabled={listing.is_sold || !canBuy}
                >
                  {listing.is_sold ? 'Vândut' : !canBuy ? 'Selectează opțiunile' : 'Cumpără Acum'}
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full gap-2 font-medium" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={listing.is_sold || isInCart || !canBuy}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isInCart ? 'În coș' : !canBuy ? 'Selectează opțiunile' : 'Adaugă în coș'}
                </Button>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" size="lg" onClick={handleContact}>
                Contactează Vânzătorul
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleFavoriteToggle}
                disabled={toggleFavorite.isPending}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current text-destructive' : ''}`} />
              </Button>
              <ShareListingDialog
                listingId={listing.id}
                listingTitle={listing.title}
                listingPrice={listing.buy_now_price || listing.price}
                listingImage={primaryImage}
              >
                <Button variant="outline" size="lg" className="gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/20">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </Button>
              </ShareListingDialog>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-3">Descriere</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description || 'Nu există descriere.'}
              </p>
            </div>

            <Separator />

            {/* Seller Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={sellerProfile?.avatar_url || undefined} />
                    <AvatarFallback className="text-lg">
                      {sellerName[0]?.toUpperCase() || 'V'}
                    </AvatarFallback>
                  </Avatar>
                   <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg font-mono">{sellerName}</p>
                      <VerifiedBadge userId={listing.seller_id} size="md" />
                    </div>
                    {sellerStats && (
                      <div className="flex items-center gap-2 text-sm">
                        <StarRating rating={sellerStats.average_rating} size="sm" />
                        <span className="text-muted-foreground">
                          ({sellerStats.total_reviews} recenzii)
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {sellerStats?.total_sales || 0} vânzări · Membru din {
                        format(new Date(sellerProfile?.created_at || new Date()), 'MMM yyyy')
                      }
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/seller/${listing.seller_id}`}>Vezi Profil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Plăți securizate prin PayPal</span>
              </div>
              {user?.id !== listing.seller_id && (
                <ReportListingDialog listingId={listing.id} listingTitle={listing.title} />
              )}
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Articole Similare</h2>
          <SimilarListings 
            listingId={listing.id} 
            categoryId={listing.category_id} 
            sellerId={listing.seller_id}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetail;
