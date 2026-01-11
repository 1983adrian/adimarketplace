import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/reviews/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { MapPin, Calendar, ShoppingBag, Star, MessageCircle, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSellerReviews, useSellerStats } from '@/hooks/useReviews';
import { format } from 'date-fns';

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch seller profile
  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ['seller-profile', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch seller listings
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['seller-listings', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images (*),
          categories (*)
        `)
        .eq('seller_id', id)
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useSellerReviews(id);
  const { data: stats, isLoading: statsLoading } = useSellerStats(id);

  if (sellerLoading || statsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-start gap-6 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!seller) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Seller not found</h1>
          <Button asChild>
            <Link to="/browse">Browse Listings</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const displayName = seller.display_name || seller.username || 'Seller';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={seller.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {displayName[0]?.toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  {stats && stats.total_sales >= 10 && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Verified Seller
                    </Badge>
                  )}
                </div>

                {seller.bio && (
                  <p className="text-muted-foreground mb-3">{seller.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {seller.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {seller.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {format(new Date(stats?.member_since || seller.created_at), 'MMM yyyy')}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="font-semibold">{stats?.average_rating || 0}</span>
                    <span className="text-muted-foreground">
                      ({stats?.total_reviews || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{stats?.total_sales || 0}</span>
                    <span className="text-muted-foreground">sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{listings?.length || 0}</span>
                    <span className="text-muted-foreground">active listings</span>
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Seller
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rating Summary */}
        {stats && stats.total_reviews > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{stats.average_rating}</p>
                  <StarRating rating={stats.average_rating} size="md" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.total_reviews} reviews
                  </p>
                </div>
                <div className="flex-1">
                  {/* Rating breakdown could go here */}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs: Listings and Reviews */}
        <Tabs defaultValue="listings">
          <TabsList className="mb-6">
            <TabsTrigger value="listings">
              Listings ({listings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({reviews?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {listingsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <ListingGrid listings={listings} isLoading={false} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active listings</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <Card>
                <CardContent className="p-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SellerProfile;
