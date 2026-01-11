import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Heart, MessageCircle, Settings, Plus, Eye, DollarSign, CreditCard, Crown, TrendingUp, ShoppingCart } from 'lucide-react';
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

  const isSubscribed = subscription?.subscribed || false;

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
                    <CardTitle className="text-lg">{t('dashboard.subscription')}</CardTitle>
                    <CardDescription>
                      {isSubscribed 
                        ? `${t('dashboard.subscribed')} ${subscription?.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : 'N/A'}`
                        : `${t('dashboard.subscribe')} (£1/month)`
                      }
                    </CardDescription>
                  </div>
                </div>
                {isSubscribed ? (
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
            {!isSubscribed && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.sellerBenefits')}
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

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
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
            <ListingGrid listings={activeListings.slice(0, 4)} isLoading={listingsLoading} />
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
