import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { useIsTopSeller } from '@/hooks/useTopSellers';
import { 
  Calendar, ShoppingBag, Star, MessageCircle, Store, Settings, 
  Package, BarChart3, TrendingUp, Globe, CheckCircle2, AlertCircle,
  Loader2, Save, ExternalLink, Shield, Zap, CreditCard
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSellerReviews, useSellerStats } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const StorePage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOwner = user?.id === id;
  const { data: isTopSeller } = useIsTopSeller(id);

  // PayPal state
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [paypalStatus, setPaypalStatus] = useState<{
    connected: boolean;
    email?: string;
    loading: boolean;
  }>({ connected: false, loading: true });

  // Check PayPal status on load
  useEffect(() => {
    const checkStatus = async () => {
      if (!isOwner || !user) {
        setPaypalStatus(prev => ({ ...prev, loading: false }));
        return;
      }
      try {
        const res = await supabase.functions.invoke('paypal-onboard-seller', {
          body: { action: 'get-status' },
        });
        if (res.data && !res.error) {
          setPaypalStatus({ connected: res.data.connected, email: res.data.email, loading: false });
          if (res.data.email) setPaypalEmail(res.data.email);
        } else {
          setPaypalStatus(prev => ({ ...prev, loading: false }));
        }
      } catch {
        setPaypalStatus(prev => ({ ...prev, loading: false }));
      }
    };
    checkStatus();
  }, [isOwner, user]);

  const handleSavePaypal = async () => {
    if (!user || !paypalEmail.trim()) return;
    setSavingPaypal(true);
    try {
      const res = await supabase.functions.invoke('paypal-onboard-seller', {
        body: { action: 'save-email', paypal_email: paypalEmail.trim() },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      setPaypalStatus({ connected: true, email: res.data.email, loading: false });
      toast({ title: '✅ PayPal salvat', description: 'Email-ul PayPal a fost configurat cu succes.' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setSavingPaypal(false);
    }
  };

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
          .select('user_id, store_name, avatar_url, bio, is_verified, is_seller, created_at, average_rating, short_id')
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

  const shortId = (seller as any).short_id ? `#${(seller as any).short_id}` : '';
  // Store name visible publicly ONLY for top sellers with blue badge
  const publicStoreName = isTopSeller ? ((seller as any).store_name || null) : null;
  const displayName = isOwner 
    ? ((seller as any).store_name || (seller as any).display_name || shortId || 'Magazin')
    : (publicStoreName || shortId || 'Magazin');

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
              {/* Show short_id separately only when store name is displayed (top sellers) */}
              {publicStoreName && shortId && (
                <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-xs font-mono font-bold">
                  {shortId}
                </span>
              )}
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

        {/* Owner PayPal Section - Real Integration */}
        {isOwner && (
          <Card className="mb-6 border-2 border-[#0070ba]/30 shadow-lg overflow-hidden">
            {/* PayPal Header */}
            <div className="bg-gradient-to-r from-[#003087] to-[#0070ba] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">PayPal Business</h3>
                  <p className="text-white/70 text-sm">Conectează-ți contul pentru a primi plăți</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              {paypalStatus.loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0070ba]" />
                  <span className="ml-3 text-muted-foreground">Se verifică statusul PayPal...</span>
                </div>
              ) : paypalStatus.connected ? (
                <>
                  {/* Connected State */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">Cont PayPal Conectat ✓</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Merchant ID: {paypalStatus.merchant_id || 'Verificat'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border",
                      paypalStatus.payments_receivable
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                    )}>
                      {paypalStatus.payments_receivable ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      )}
                      <span className="text-xs font-medium">
                        {paypalStatus.payments_receivable ? 'Plăți active' : 'Plăți inactive'}
                      </span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border",
                      paypalStatus.email_confirmed
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                    )}>
                      {paypalStatus.email_confirmed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      )}
                      <span className="text-xs font-medium">
                        {paypalStatus.email_confirmed ? 'Email verificat' : 'Email neverificat'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Not Connected State */}
                  <div className="text-center py-4">
                    <div className="h-16 w-16 rounded-2xl bg-[#0070ba]/10 flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-[#0070ba]" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">Conectează PayPal</h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      Conectează-ți contul PayPal Business pentru a primi plăți automat de la cumpărători.
                    </p>

                    <Button
                      onClick={handleConnectPayPal}
                      disabled={connectingPaypal}
                      size="lg"
                      className="gap-2.5 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold px-8 py-3 text-base shadow-lg shadow-[#0070ba]/25"
                    >
                      {connectingPaypal ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-5 w-5" />
                      )}
                      {connectingPaypal ? 'Se conectează...' : 'Conectează cu PayPal'}
                    </Button>
                  </div>

                  {/* Benefits */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50">
                      <Shield className="h-4 w-4 text-[#0070ba] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">Protecție Vânzător</p>
                        <p className="text-[10px] text-muted-foreground">Tranzacții securizate PayPal</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50">
                      <Zap className="h-4 w-4 text-[#0070ba] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">Plăți Instant</p>
                        <p className="text-[10px] text-muted-foreground">Bani direct în contul tău</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50">
                      <Globe className="h-4 w-4 text-[#0070ba] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">200+ Țări</p>
                        <p className="text-[10px] text-muted-foreground">Acceptă plăți global</p>
                      </div>
                    </div>
                  </div>

                  {/* Fallback manual email */}
                  <div className="border-t pt-4 mt-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Sau adaugă manual email-ul PayPal Business:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="adresa@paypal.com"
                        className="flex-1 text-sm"
                      />
                      <Button onClick={handleSavePaypal} disabled={savingPaypal} size="sm" variant="outline" className="gap-1.5 shrink-0">
                        {savingPaypal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Salvează
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Info footer */}
              <p className="text-[11px] text-muted-foreground border-t pt-3">
                🔒 Tracking-ul comenzilor se sincronizează automat cu PayPal când adaugi AWB-ul.
              </p>
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
