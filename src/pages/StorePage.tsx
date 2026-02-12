import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { SEOHead } from '@/components/seo/SEOHead';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { TopSellerBadge } from '@/components/TopSellerBadge';
import { 
  Calendar, ShoppingBag, Star, MessageCircle, Store, Settings, 
  Package, BarChart3, TrendingUp, Globe, CheckCircle2, AlertCircle,
  Loader2, Save, ExternalLink
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSellerReviews, useSellerStats } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const StorePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOwner = user?.id === id;

  // For owner: PayPal editing
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [savingPaypal, setSavingPaypal] = useState(false);

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ['store-profile', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Owner sees full profile, visitors see public fields only
      if (isOwner) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .maybeSingle();
        if (error) throw error;
        if (data && !paypalLoaded) {
          setPaypalEmail((data as any).paypal_email || '');
          setPaypalLoaded(true);
        }
        return data;
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, display_name, username, store_name, avatar_url, bio, is_verified, is_seller, created_at, average_rating')
          .eq('user_id', id)
          .eq('is_seller', true)
          .maybeSingle();
        if (error) throw error;
        return data;
      }
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

  const handleSavePaypal = async () => {
    if (!user) return;
    setSavingPaypal(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ paypal_email: paypalEmail || null } as any)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Salvat', description: 'Email-ul PayPal a fost actualizat.' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setSavingPaypal(false);
    }
  };

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

  const displayName = (seller as any).store_name || (seller as any).display_name || (seller as any).username || 'Magazin';

  return (
    <Layout>
      <SEOHead 
        title={`${displayName} - Marketplace România`}
        description={(seller as any).bio || `Vizitează magazinul ${displayName} pe Marketplace România.`}
      />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Store Header */}
        <Card className="mb-6 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="h-28 md:h-36 bg-gradient-to-r from-primary via-blue-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -bottom-12 left-6">
              <Avatar className="h-24 w-24 ring-4 ring-slate-900 shadow-2xl">
                <AvatarImage src={(seller as any).avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-3xl font-bold">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Owner Quick Actions */}
            {isOwner && (
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
            )}
          </div>

          <CardContent className="pt-14 pb-6 px-6">
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{displayName}</h1>
              <VerifiedBadge userId={id!} size="lg" />
              <TopSellerBadge userId={id!} size="md" showLabel />
            </div>
            {(seller as any).bio && (
              <p className="text-white/60 text-sm mt-1 max-w-xl leading-relaxed">{(seller as any).bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
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
                <span className="text-[11px] text-white/50 uppercase tracking-wider">Produse</span>
              </div>
              <div className="text-center p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <Calendar className="h-4 w-4 mx-auto mb-1 text-purple-400" />
                <span className="text-[11px] text-white/50 uppercase tracking-wider">
                  Din {format(new Date((seller as any).created_at), 'MMM yyyy', { locale: ro })}
                </span>
              </div>
            </div>

            {/* Contact button for non-owners */}
            {!isOwner && user && (
              <Button asChild variant="secondary" className="mt-4 gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Link to={`/messages?seller=${id}`}>
                  <MessageCircle className="h-4 w-4" />
                  Contactează Vânzătorul
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Owner Quick Actions */}
        {isOwner && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs font-medium" onClick={() => navigate('/sell')}>
              <Package className="h-5 w-5 text-primary" />
              Adaugă Produs
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs font-medium" onClick={() => navigate('/my-products')}>
              <ShoppingBag className="h-5 w-5 text-primary" />
              Produsele Mele
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs font-medium" onClick={() => navigate('/orders')}>
              <TrendingUp className="h-5 w-5 text-primary" />
              Comenzi
            </Button>
          </div>
        )}

        {/* Owner PayPal Section */}
        {isOwner && (
          <Card className="mb-6 border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Cont PayPal
              </CardTitle>
              <CardDescription>Conectează contul PayPal pentru a primi plăți din vânzări</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PayPal Connect Actions */}
              {!paypalEmail && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://www.paypal.com/ro/webapps/mpp/account-selection"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0070ba] text-white text-sm font-medium hover:bg-[#005ea6] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Creează Cont PayPal
                  </a>
                  <p className="text-sm text-muted-foreground self-center">
                    sau adaugă email-ul contului PayPal existent mai jos
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Email PayPal</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="email@paypal.com"
                    className="flex-1"
                  />
                  <Button onClick={handleSavePaypal} disabled={savingPaypal} size="default" className="gap-1.5">
                    {savingPaypal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvează
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tracking-ul comenzilor se sincronizează automat cu PayPal când adaugi AWB.
                </p>
              </div>

              {paypalEmail ? (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700 dark:text-green-400">PayPal conectat ✅</AlertTitle>
                  <AlertDescription>
                    Contul PayPal ({paypalEmail}) este activ. Vei primi plățile automat.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>PayPal neconfigurat</AlertTitle>
                  <AlertDescription>
                    Fără PayPal nu poți primi banii din vânzări. Creează un cont sau adaugă email-ul existent.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Products & Reviews Tabs */}
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
                  <p className="font-medium mb-1">Niciun produs disponibil</p>
                  {isOwner && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">Adaugă primul tău produs pentru a începe să vinzi</p>
                      <Button onClick={() => navigate('/sell')} className="gap-2">
                        <Package className="h-4 w-4" />
                        Adaugă Produs
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviews && reviews.length > 0 ? (
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
      </div>
    </Layout>
  );
};

export default StorePage;
