import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/reviews/StarRating';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { SEOHead } from '@/components/seo/SEOHead';
import { 
  Calendar, ShoppingBag, Star, Shield, MessageCircle, Store
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSellerReviews, useSellerStats } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { TopSellerBadge } from '@/components/TopSellerBadge';
import { ReviewCard } from '@/components/reviews/ReviewCard';

const StorePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ['public-store', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, store_name, avatar_url, bio, is_verified, is_seller, created_at, average_rating')
        .eq('user_id', id)
        .eq('is_seller', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['store-listings', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('listings')
        .select(`*, listing_images (*), categories (*)`)
        .eq('seller_id', id)
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useSellerReviews(id);
  const { data: stats } = useSellerStats(id);

  if (sellerLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-start gap-6 mb-8">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!seller) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="text-2xl font-bold mb-2">Magazin negăsit</h1>
          <p className="text-muted-foreground mb-6">Acest magazin nu există sau nu mai este activ.</p>
          <Button asChild><Link to="/browse">Explorează Produse</Link></Button>
        </div>
      </Layout>
    );
  }

  const displayName = seller.store_name || seller.display_name || seller.username || 'Magazin';
  const isOwner = user?.id === id;

  return (
    <Layout>
      <SEOHead 
        title={`${displayName} - Marketplace România`}
        description={seller.bio || `Vizitează magazinul ${displayName} pe Marketplace România. Produse de calitate, livrare rapidă.`}
      />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Store Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
                <AvatarImage src={seller.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  <VerifiedBadge userId={id!} size="md" />
                  <TopSellerBadge userId={id!} size="sm" showLabel />
                </div>
                {seller.bio && (
                  <p className="text-muted-foreground text-sm mt-1 max-w-lg">{seller.bio}</p>
                )}
              </div>
              {!isOwner && user && (
                <Button asChild variant="outline" className="gap-2">
                  <Link to={`/messages?seller=${id}`}>
                    <MessageCircle className="h-4 w-4" />
                    Contactează
                  </Link>
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{stats?.average_rating?.toFixed(1) || '0.0'}</span>
                </div>
                <span className="text-xs text-muted-foreground">{stats?.total_reviews || 0} recenzii</span>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <ShoppingBag className="h-4 w-4 mx-auto mb-1 text-primary" />
                <span className="font-bold">{listings?.length || 0}</span>
                <p className="text-xs text-muted-foreground">produse</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <Calendar className="h-4 w-4 mx-auto mb-1 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Din {format(new Date(seller.created_at), 'MMM yyyy', { locale: ro })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Produse ({listings?.length || 0})
          </h2>
        </div>

        {listingsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : listings && listings.length > 0 ? (
          <ListingGrid listings={listings} isLoading={false} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium">Niciun produs disponibil momentan</p>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-amber-400" />
              Recenzii ({reviews.length})
            </h2>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StorePage;
