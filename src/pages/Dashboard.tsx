import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Heart, Eye, DollarSign, CreditCard, Crown, TrendingUp, Pencil, Gavel, Clock, Plus, Settings, MessageCircle, BookOpen, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SellerQuickActions } from '@/components/dashboard/SellerQuickActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useMyListings } from '@/hooks/useListings';
import { useFavorites } from '@/hooks/useFavorites';
import { useSellerSubscription, useCreateSellerSubscription, useSellerPortal } from '@/hooks/useSellerSubscription';
import { useMyAuctionListings } from '@/hooks/useBids';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { data: myListings, isLoading: listingsLoading } = useMyListings(user?.id);
  const { data: favorites, isLoading: favoritesLoading } = useFavorites(user?.id);
  const { data: subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useSellerSubscription();
  const { data: auctionListings, isLoading: auctionsLoading } = useMyAuctionListings();
  const createSubscription = useCreateSellerSubscription();
  const openPortal = useSellerPortal();

  // Handle subscription success/cancel from URL params
  React.useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      toast({ title: t('dashboard.subscriptionActivated'), description: t('dashboard.canCreateListings') });
      refetchSubscription();
    } else if (subscriptionStatus === 'canceled') {
      toast({ title: t('dashboard.subscriptionCanceled'), description: t('dashboard.canSubscribeAnytime'), variant: 'destructive' });
    }
  }, [searchParams, toast, refetchSubscription, t]);

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  const activeListings = myListings?.filter(l => l.is_active && !l.is_sold) || [];
  const soldListings = myListings?.filter(l => l.is_sold) || [];
  const totalViews = myListings?.reduce((acc, l) => acc + l.views_count, 0) || 0;
  
  // Real earnings: sold price minus 10% platform commission
  const totalEarnings = soldListings.reduce((acc, l) => {
    const commission = l.price * 0.10; // 10% commission
    return acc + (l.price - commission);
  }, 0);
  
  // Potential earnings calculation (price - 10% platform commission)
  const potentialGrossEarnings = activeListings.reduce((acc, l) => acc + l.price, 0);
  const platformCommission = potentialGrossEarnings * 0.10; // 10% of total
  const potentialNetEarnings = potentialGrossEarnings - platformCommission;

  const isSubscribed = subscription?.subscribed || false;
  const isTrialPeriod = subscription?.isTrialPeriod || false;
  const trialDaysRemaining = subscription?.trialDaysRemaining || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile?.display_name || t('dashboard.welcome')}</h1>
                {isSubscribed && (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="h-3 w-3" />
                    {t('dashboard.seller')}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isSubscribed ? (
              <Button asChild>
                <Link to="/sell" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('dashboard.newListing')}
                </Link>
              </Button>
            ) : (
              <Button 
                onClick={() => createSubscription.mutate()} 
                disabled={createSubscription.isPending}
                className="gap-2"
              >
                <Crown className="h-4 w-4" />
                {createSubscription.isPending ? t('dashboard.loading') : `${t('dashboard.becomeSeller')} (£1)`}
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/settings" className="gap-2">
                <Settings className="h-4 w-4" />
                {t('header.settings')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Seller Subscription Card */}
        {!subscriptionLoading && (
          <Card className={`mb-8 ${isSubscribed ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className={`h-6 w-6 ${isSubscribed ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <CardTitle className="text-lg">
                      {isTrialPeriod ? 'Free Trial' : t('dashboard.subscription')}
                    </CardTitle>
                    <CardDescription>
                      {isTrialPeriod 
                        ? `${trialDaysRemaining} days remaining in your free trial`
                        : isSubscribed 
                          ? `${t('dashboard.subscribed')} ${subscription?.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : 'N/A'}`
                          : subscription?.trialExpired 
                            ? 'Your free trial has expired'
                            : `${t('dashboard.subscribe')} (£1/month after 3 months free)`
                      }
                    </CardDescription>
                  </div>
                </div>
                {isTrialPeriod ? (
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
                    Trial Active
                  </Badge>
                ) : isSubscribed ? (
                  <Button 
                    variant="outline" 
                    onClick={() => openPortal.mutate()}
                    disabled={openPortal.isPending}
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    {openPortal.isPending ? t('dashboard.loading') : t('dashboard.manageSubscription')}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => createSubscription.mutate()}
                    disabled={createSubscription.isPending}
                  >
                    {createSubscription.isPending ? t('dashboard.loading') : t('dashboard.subscribeNow')}
                  </Button>
                )}
              </div>
            </CardHeader>
            {isTrialPeriod && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Enjoy free access to all seller features. After 3 months, a £1/month subscription is required to continue listing items.
                </p>
              </CardContent>
            )}
            {!isSubscribed && !isTrialPeriod && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {subscription?.trialExpired 
                    ? 'Subscribe now to continue creating listings and selling on the platform.'
                    : t('dashboard.sellerBenefits')
                  }
                </p>
              </CardContent>
            )}
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{activeListings.length}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.activeListings')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{favorites?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('header.favorites')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{totalViews}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.totalViews')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">£{totalEarnings.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.totalEarned')}</p>
                  <p className="text-xs text-muted-foreground">({soldListings.length} vânzări, -10% comision)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Potential Earnings Motivational Card */}
        {activeListings.length > 0 && (
          <Card className="mb-8 border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/20">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg text-green-700 dark:text-green-400">
                    💰 Potențial de Câștig
                  </CardTitle>
                  <CardDescription>
                    Ai <strong>{activeListings.length} {activeListings.length === 1 ? 'produs activ' : 'produse active'}</strong>. Dacă le vinzi pe toate:
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Produse Active</p>
                  <p className="text-2xl font-bold text-foreground">{activeListings.length}</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Valoare Totală</p>
                  <p className="text-2xl font-bold text-foreground">£{potentialGrossEarnings.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Comision (10%)</p>
                  <p className="text-2xl font-bold text-orange-600">-£{platformCommission.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-green-500/20 rounded-lg border-2 border-green-500/30">
                  <p className="text-sm text-green-700 dark:text-green-400 mb-1 font-medium">Tu Vei Încasa (90%)</p>
                  <p className="text-3xl font-bold text-green-600">£{potentialNetEarnings.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Detailed breakdown per product */}
              {activeListings.length <= 10 && (
                <div className="mt-4 p-3 bg-background/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Detalii per produs:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {activeListings.map((listing, index) => {
                      const itemCommission = listing.price * 0.10;
                      const netAmount = listing.price - itemCommission;
                      return (
                        <div key={listing.id} className="flex justify-between text-xs">
                          <span className="truncate max-w-[200px]">{index + 1}. {listing.title}</span>
                          <span className="font-medium">£{listing.price.toFixed(2)} - 10% = <span className="text-green-600">£{netAmount.toFixed(2)}</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                * Calcul real bazat pe prețurile produselor tale (10% comision platformă). Banii se transferă automat după confirmarea livrării.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ultra Pro Quick Actions - Categorized */}
        <SellerQuickActions />

        {/* My Auctions Section - for sellers */}
        {isSubscribed && auctionListings && auctionListings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Gavel className="h-5 w-5 text-primary" />
                Licitațiile Mele
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctionListings.map((auction) => {
                const isEnded = auction.auction_end_date && new Date(auction.auction_end_date) < new Date();
                const timeRemaining = auction.auction_end_date 
                  ? formatDistanceToNow(new Date(auction.auction_end_date), { addSuffix: true, locale: ro })
                  : null;
                
                return (
                  <Card key={auction.id} className={`overflow-hidden ${isEnded ? 'opacity-75' : 'border-primary/20'}`}>
                    <div className="flex">
                      {/* Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-muted">
                        {auction.listing_images?.[0] && (
                          <img 
                            src={auction.listing_images[0].image_url} 
                            alt={auction.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm line-clamp-1">{auction.title}</h3>
                          <Badge 
                            variant={isEnded ? 'secondary' : 'default'}
                            className={`text-xs flex-shrink-0 ${!isEnded ? 'bg-green-500 hover:bg-green-600' : ''}`}
                          >
                            {isEnded ? 'Încheiată' : 'Activă'}
                          </Badge>
                        </div>
                        
                        {/* Bid info */}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Cea mai mare ofertă:</span>
                            <span className="font-bold text-primary">
                              {auction.highest_bid ? formatPrice(auction.highest_bid) : 'Fără oferte'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {auction.bid_count} oferte
                            </span>
                            {timeRemaining && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {timeRemaining}
                              </span>
                            )}
                          </div>
                          
                          {/* Latest bidder */}
                          {auction.bidder_profile && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded text-xs">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                  {auction.bidder_profile.display_name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">
                                Ultima ofertă de <strong>{auction.bidder_profile.display_name || auction.bidder_profile.username || 'Utilizator'}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" asChild className="flex-1 h-7 text-xs">
                            <Link to={`/listing/${auction.id}`}>Vezi Detalii</Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                            <Link to={`/edit-listing/${auction.id}`}>
                              <Pencil className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* My Listings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{t('dashboard.myListings')}</h2>
            {isSubscribed && (
              <Button variant="ghost" asChild>
                <Link to="/sell">{t('common.viewAll')}</Link>
              </Button>
            )}
          </div>
          {activeListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeListings.slice(0, 4).map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    {listing.listing_images?.[0] && (
                      <img 
                        src={listing.listing_images[0].image_url} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <Link 
                      to={`/edit-listing/${listing.id}`}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">{listing.title}</h3>
                    <p className="text-primary font-bold">£{listing.price}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={listing.is_active ? "default" : "secondary"} className="text-xs">
                        {listing.is_active ? 'Active' : 'Draft'}
                      </Badge>
                      {listing.is_sold && (
                        <Badge variant="destructive" className="text-xs">Sold</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">{t('dashboard.noListings')}</h3>
                <p className="text-muted-foreground mb-4">
                  {isSubscribed 
                    ? t('dashboard.startSelling')
                    : t('dashboard.subscribeToSell')
                  }
                </p>
                {isSubscribed ? (
                  <Button asChild>
                    <Link to="/sell">{t('dashboard.createListing')}</Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={() => createSubscription.mutate()}
                    disabled={createSubscription.isPending}
                  >
                    {createSubscription.isPending ? t('dashboard.loading') : t('dashboard.becomeSeller')}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
