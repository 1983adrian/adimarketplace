import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/reviews/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { 
  Calendar, ShoppingBag, Star, Shield, Crown, TrendingUp, 
  Settings, Package, BarChart3, Lock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSellerReviews, useSellerStats } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { TopSellerBadge } from '@/components/TopSellerBadge';
import marketplaceBanner from '@/assets/marketplace-romania-banner.png';

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Owner-only check: profile pages are private
  const isOwner = user?.id === id;

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ['seller-profile', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && isOwner,
  });

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['seller-listings', id],
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
    enabled: !!id && isOwner,
  });

  const { data: reviews, isLoading: reviewsLoading } = useSellerReviews(isOwner ? id : undefined);
  const { data: stats, isLoading: statsLoading } = useSellerStats(isOwner ? id : undefined);

  // Redirect non-owners
  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Pagină Privată</h1>
          <p className="text-muted-foreground mb-6">Trebuie să fii autentificat pentru a vedea profilul.</p>
          <Button asChild><Link to="/login">Autentifică-te</Link></Button>
        </div>
      </Layout>
    );
  }

  if (!authLoading && user && !isOwner) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Acces Restricționat</h1>
          <p className="text-muted-foreground mb-6">Poți vedea doar propriul tău profil de vânzător.</p>
          <Button asChild><Link to={`/seller/${user.id}`}>Profilul Meu</Link></Button>
        </div>
      </Layout>
    );
  }

  if (sellerLoading || statsLoading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-start gap-6 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!seller) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Profil negăsit</h1>
          <Button asChild><Link to="/browse">Explorează Produse</Link></Button>
        </div>
      </Layout>
    );
  }

  const displayName = seller.display_name || seller.username || 'Vânzător';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Modern Profile Header */}
        <Card className="mb-6 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          {/* Gradient Banner */}
          <div className="h-28 md:h-36 bg-gradient-to-r from-primary via-blue-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -bottom-12 left-6">
              <Avatar className="h-24 w-24 ring-4 ring-slate-900 shadow-2xl">
                <AvatarImage src={seller.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-3xl font-bold">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Quick Actions - top right */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 bg-white/15 backdrop-blur-sm border-white/20 text-white hover:bg-white/25 text-xs"
                onClick={() => navigate('/profile-settings')}
              >
                <Settings className="h-3.5 w-3.5" />
                Editează
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 bg-white/15 backdrop-blur-sm border-white/20 text-white hover:bg-white/25 text-xs"
                onClick={() => navigate('/seller-analytics')}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Statistici
              </Button>
            </div>
          </div>

          <CardContent className="pt-14 pb-6 px-6">
            {/* Name & Badges */}
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {seller.store_name || displayName}
              </h1>
              <VerifiedBadge userId={id!} size="lg" />
              <TopSellerBadge userId={id!} size="md" showLabel />
              {seller.is_verified && (
                <Badge className="gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                  <Shield className="h-3 w-3" />KYC Verificat
                </Badge>
              )}
            </div>
            
            {seller.bio && (
              <p className="text-white/60 text-sm mb-5 max-w-xl leading-relaxed">{seller.bio}</p>
            )}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-bold text-amber-400">
                    {stats?.average_rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <span className="text-[11px] text-white/50 uppercase tracking-wider">
                  Rating ({stats?.total_reviews || 0})
                </span>
              </div>
              
              <div className="text-center p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xl font-bold text-emerald-400">{stats?.total_sales || 0}</span>
                </div>
                <span className="text-[11px] text-white/50 uppercase tracking-wider">Vânzări</span>
              </div>
              
              <div className="text-center p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <ShoppingBag className="h-4 w-4 text-blue-400" />
                  <span className="text-xl font-bold text-blue-400">{listings?.length || 0}</span>
                </div>
                <span className="text-[11px] text-white/50 uppercase tracking-wider">Produse Active</span>
              </div>
              
              <div className="text-center p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Calendar className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-[11px] text-white/50 uppercase tracking-wider">
                  Membru din {format(new Date(stats?.member_since || seller.created_at), 'MMM yyyy', { locale: ro })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1.5 text-xs font-medium"
            onClick={() => navigate('/sell')}
          >
            <Package className="h-5 w-5 text-primary" />
            Adaugă Produs
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1.5 text-xs font-medium"
            onClick={() => navigate('/my-products')}
          >
            <ShoppingBag className="h-5 w-5 text-primary" />
            Produsele Mele
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1.5 text-xs font-medium"
            onClick={() => navigate('/orders')}
          >
            <TrendingUp className="h-5 w-5 text-primary" />
            Comenzi
          </Button>
        </div>

        {/* Tabs: Products & Reviews */}
        <Tabs defaultValue="listings">
          <TabsList className="mb-4 w-full grid grid-cols-2 h-12 rounded-xl bg-muted/50">
            <TabsTrigger value="listings" className="rounded-lg text-sm font-medium">
              Produse ({listings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg text-sm font-medium">
              Recenzii ({reviews?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
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
                  <p className="font-medium mb-1">Niciun produs activ</p>
                  <p className="text-sm text-muted-foreground mb-4">Adaugă primul tău produs pentru a începe să vinzi</p>
                  <Button onClick={() => navigate('/sell')} className="gap-2">
                    <Package className="h-4 w-4" />
                    Adaugă Produs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="font-medium mb-1">Nicio recenzie încă</p>
                  <p className="text-sm text-muted-foreground">Recenziile vor apărea după finalizarea vânzărilor</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Brand Banner */}
        <div className="mt-8 -mx-4">
          <img 
            src={marketplaceBanner} 
            alt="Market Place România" 
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </Layout>
  );
};

export default SellerProfile;
