import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { MapPin, Calendar, ShoppingBag, Star, MessageCircle, Shield, Share2, Crown, TrendingUp } from 'lucide-react';
import { ShareStoreDialog } from '@/components/seller/ShareStoreDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSellerReviews, useSellerStats } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateConversation } from '@/hooks/useConversations';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { AddFriendButton } from '@/components/messages/AddFriendButton';
import { TopSellerBadge } from '@/components/TopSellerBadge';

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ['seller-profile', id],
    queryFn: async () => {
      if (!id) return null;
      // Use secure public view that only exposes safe columns
      const { data, error } = await supabase
        .from('public_seller_profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
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
    enabled: !!id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useSellerReviews(id);
  const { data: stats, isLoading: statsLoading } = useSellerStats(id);

  const handleContactSeller = async () => {
    if (!user) {
      toast.error('Trebuie să fii autentificat');
      navigate('/login');
      return;
    }
    if (!id || !listings || listings.length === 0) {
      toast.error('Vânzătorul nu are produse active');
      return;
    }

    try {
      const result = await createConversation.mutateAsync({
        listingId: listings[0].id,
        buyerId: user.id,
        sellerId: id
      });
      navigate(`/messages?conversation=${result.id}`);
    } catch (error) {
      toast.error('Nu s-a putut iniția conversația');
    }
  };

  if (sellerLoading || statsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-start gap-6 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
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
          <h1 className="text-2xl font-bold mb-4">Vânzător negăsit</h1>
          <Button asChild><Link to="/browse">Explorează Produse</Link></Button>
        </div>
      </Layout>
    );
  }

  const displayName = seller.display_name || seller.username || 'Vânzător';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* PRO Seller Card Header */}
        <Card className="mb-8 overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
          {/* Header Banner */}
          <div className="h-24 md:h-32 bg-gradient-to-r from-primary via-primary/80 to-amber-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMGMtNC40MTggMC04LTMuNTgyLTgtOHMzLjU4Mi04IDgtOCA4IDMuNTgyIDggOC0zLjU4MiA4LTggOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="absolute -bottom-12 left-6">
              <Avatar className="h-24 w-24 ring-4 ring-slate-900 shadow-xl">
                <AvatarImage src={seller.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-3xl font-bold">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardContent className="pt-14 pb-6 px-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1">
                {/* Name & Badges */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold">{seller.store_name || displayName}</h1>
                  <VerifiedBadge userId={id!} size="lg" />
                  <TopSellerBadge userId={id!} size="md" showLabel />
                  {seller.is_verified && (
                    <Badge className="gap-1 bg-gradient-to-r from-emerald-500 to-green-500 border-0">
                      <Shield className="h-3 w-3" />Verificat KYC
                    </Badge>
                  )}
                </div>
                
                {seller.bio && <p className="text-white/70 mb-4 max-w-xl">{seller.bio}</p>}
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-xl font-bold text-amber-400">{stats?.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-xs text-white/60">Rating ({stats?.total_reviews || 0})</span>
                  </div>
                  
                  <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span className="text-xl font-bold text-emerald-400">{stats?.total_sales || 0}</span>
                    </div>
                    <span className="text-xs text-white/60">Vânzări</span>
                  </div>
                  
                  <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ShoppingBag className="h-4 w-4 text-blue-400" />
                      <span className="text-xl font-bold text-blue-400">{listings?.length || 0}</span>
                    </div>
                    <span className="text-xs text-white/60">Produse</span>
                  </div>
                  
                  <div className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-xs text-white/60">
                      Din {format(new Date(stats?.member_since || seller.created_at), 'MMM yyyy')}
                    </span>
                  </div>
                </div>

                {/* Location */}
                {seller.location && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="h-4 w-4" />
                    <span>{seller.location}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <ShareStoreDialog 
                  sellerId={id!} 
                  storeName={displayName}
                  productCount={listings?.length || 0}
                >
                  <Button variant="outline" className="gap-2 w-full border-white/20 hover:bg-white/10 text-white">
                    <Share2 className="h-4 w-4" />
                    Promovează
                  </Button>
                </ShareStoreDialog>
                <AddFriendButton targetUserId={id!} />
                <Button 
                  onClick={handleContactSeller} 
                  disabled={createConversation.isPending} 
                  className="gap-2 w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contactează
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="listings">
          <TabsList className="mb-6">
            <TabsTrigger value="listings">Produse ({listings?.length || 0})</TabsTrigger>
            <TabsTrigger value="reviews">Recenzii ({reviews?.length || 0})</TabsTrigger>
          </TabsList>
          <TabsContent value="listings">
            {listingsLoading ? <Skeleton className="aspect-square rounded-lg" /> : listings && listings.length > 0 ? <ListingGrid listings={listings} isLoading={false} /> : <Card><CardContent className="py-12 text-center"><ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p>Niciun produs activ</p></CardContent></Card>}
          </TabsContent>
          <TabsContent value="reviews">
            {reviewsLoading ? <Skeleton className="h-24 rounded-lg" /> : reviews && reviews.length > 0 ? <Card><CardContent className="p-4">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</CardContent></Card> : <Card><CardContent className="py-12 text-center"><Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p>Nicio recenzie încă</p></CardContent></Card>}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SellerProfile;
