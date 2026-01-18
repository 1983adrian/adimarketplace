import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Heart, MessageCircle, Settings, Plus, Eye, DollarSign, CreditCard, Crown, TrendingUp, ShoppingCart, Pencil, BookOpen } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMyListings } from '@/hooks/useListings';
import { useFavorites } from '@/hooks/useFavorites';
import { useSellerSubscription, useCreateSellerSubscription, useSellerPortal } from '@/hooks/useSellerSubscription';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { data: myListings, isLoading: listingsLoading } = useMyListings(user?.id);
  const { data: favorites, isLoading: favoritesLoading } = useFavorites(user?.id);
  const { data: subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useSellerSubscription();
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
  const totalEarnings = soldListings.reduce((acc, l) => acc + l.price, 0);
  
  // Potential earnings calculation (price - £1 platform commission per item)
  const potentialGrossEarnings = activeListings.reduce((acc, l) => acc + l.price, 0);
  const platformCommission = activeListings.length * 1; // £1 per item
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
                <DollarSign className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">£{totalEarnings.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.totalEarned')}</p>
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
                    Dacă vinzi toate produsele active, vei încasa:
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Valoare Totală Produse</p>
                  <p className="text-2xl font-bold text-foreground">£{potentialGrossEarnings.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Comision Platformă (£1/produs)</p>
                  <p className="text-2xl font-bold text-orange-600">-£{platformCommission.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-green-500/20 rounded-lg border-2 border-green-500/30">
                  <p className="text-sm text-green-700 dark:text-green-400 mb-1 font-medium">Tu Vei Încasa</p>
                  <p className="text-3xl font-bold text-green-600">£{potentialNetEarnings.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                * Suma netă după deducerea comisionului de £1 per produs vândut. Banii vor fi transferați în contul tău Stripe după confirmarea livrării.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Link to="/seller-guide">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <BookOpen className="h-6 w-6 mb-2 text-primary" />
                <CardTitle className="text-lg">Ghid Vânzător</CardTitle>
                <CardDescription>Tutorial complet pas cu pas</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/favorites">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <Heart className="h-6 w-6 mb-2" />
                <CardTitle className="text-lg">{t('dashboard.myFavorites')}</CardTitle>
                <CardDescription>{t('dashboard.itemsSaved')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/messages">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <MessageCircle className="h-6 w-6 mb-2" />
                <CardTitle className="text-lg">{t('header.messages')}</CardTitle>
                <CardDescription>{t('dashboard.chatWithUsers')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/orders">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <Package className="h-6 w-6 mb-2" />
                <CardTitle className="text-lg">Orders</CardTitle>
                <CardDescription>Track your orders</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/seller-analytics">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <TrendingUp className="h-6 w-6 mb-2" />
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>View your sales statistics</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/settings">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <Settings className="h-6 w-6 mb-2" />
                <CardTitle className="text-lg">{t('header.settings')}</CardTitle>
                <CardDescription>{t('dashboard.manageAccount')}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

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
