import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Shield, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { PayPalButton } from '@/components/payments/PayPalButton';
import { StarRating } from '@/components/reviews/StarRating';
import { SimilarListings } from '@/components/listings/SimilarListings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSellerStats } from '@/hooks/useReviews';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { format } from 'date-fns';

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const { data: favorites } = useFavorites(user?.id);
  const toggleFavorite = useToggleFavorite();

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
      
      // Fetch seller profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.seller_id)
        .single();
        
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
      toggleFavorite.mutate({ listingId: id, userId: user.id, isFavorite });
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

  const handleShare = async () => {
    try {
      await navigator.share({ title: listing.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied!' });
    }
  };

  const images = listing.listing_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
  const primaryImage = images.find((img: any) => img.is_primary)?.image_url || images[0]?.image_url;
  const sellerProfile = listing.seller_profile;
  const sellerName = sellerProfile?.display_name || sellerProfile?.username || 'Seller';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img 
                src={images[selectedImage]?.image_url || primaryImage || '/placeholder.svg'} 
                alt={listing.title} 
                className="w-full h-full object-cover" 
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img: any, index: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImage ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge>{conditionLabels[listing.condition]}</Badge>
                {listing.categories && (
                  <Badge variant="outline">{listing.categories.name}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <p className="text-4xl font-bold text-primary">{formatPrice(listing.price)}</p>
            </div>

            {listing.location && (
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {listing.location}
              </p>
            )}

            {/* PayPal Buy Now Button */}
            <div className="mb-4">
              <PayPalButton listingId={listing.id} className="w-full" />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" size="lg" onClick={handleContact}>
                Contact Seller
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleFavoriteToggle}
                disabled={toggleFavorite.isPending}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current text-destructive' : ''}`} />
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
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
                      {sellerName[0]?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{sellerName}</p>
                    {sellerStats && (
                      <div className="flex items-center gap-2 text-sm">
                        <StarRating rating={sellerStats.average_rating} size="sm" />
                        <span className="text-muted-foreground">
                          ({sellerStats.total_reviews} reviews)
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {sellerStats?.total_sales || 0} sales · Member since {
                        format(new Date(sellerProfile?.created_at || new Date()), 'MMM yyyy')
                      }
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/seller/${listing.seller_id}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure payments through PayPal</span>
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
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
