import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Eye, 
  ShoppingCart,
  Calendar,
  Gavel
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useMyListings } from '@/hooks/useListings';
import { useMyOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const SellerAnalytics = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { data: myListings } = useMyListings(user?.id);
  const { data: sellingOrders } = useMyOrders('selling');

  // Real data calculations
  const activeListings = myListings?.filter(l => l.is_active && !l.is_sold) || [];
  const soldListings = myListings?.filter(l => l.is_sold) || [];
  const totalViews = myListings?.reduce((acc, l) => acc + l.views_count, 0) || 0;
  
  // Real orders where user is seller
  const sellerOrders = sellingOrders || [];
  const completedOrders = sellerOrders.filter(o => o.status === 'delivered');
  const pendingOrders = sellerOrders.filter(o => o.status === 'pending' || o.status === 'paid' || o.status === 'shipped');
  
  // Real earnings from completed orders (0% platform commission)
  const totalEarnings = completedOrders.reduce((acc, o) => acc + o.amount, 0);
  
  const pendingEarnings = pendingOrders.reduce((acc, o) => acc + o.amount, 0);
  
  const avgPrice = soldListings.length > 0 
    ? soldListings.reduce((acc, l) => acc + l.price, 0) / soldListings.length 
    : 0;

  // Auction listings
  const auctionListings = myListings?.filter(l => 
    l.listing_type === 'auction' || l.listing_type === 'both'
  ) || [];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analize Vânzări</h1>
            <p className="text-muted-foreground">Date reale din activitatea ta pe platformă</p>
          </div>
          <Button asChild>
            <Link to="/dashboard">{t('common.back')}</Link>
          </Button>
        </div>

        {/* Stats Overview - Only performance metrics, no balance (balance is in Wallet) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Comenzi Livrate</p>
                  <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Vânzări finalizate cu succes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">În Procesare</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingOrders.length}</p>
                </div>
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <Package className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Comenzi în așteptare/expediere
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vizualizări Totale</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Pe {myListings?.length || 0} produse
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Preț Mediu</p>
                  <p className="text-2xl font-bold">{formatPrice(avgPrice)}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Bazat pe {soldListings.length} vânzări
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Produse Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{activeListings.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Disponibile pentru cumpărare
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Produse Vândute
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">{soldListings.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Total vânzări finalizate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gavel className="h-5 w-5 text-amber-600" />
                La Licitație
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-amber-600">{auctionListings.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Produse cu licitație activă
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        {sellerOrders.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Comenzi Recente
              </CardTitle>
              <CardDescription>Ultimele tale comenzi pe platformă</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sellerOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">
                        Comandă #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'shipped' ? 'secondary' :
                        order.status === 'cancelled' ? 'destructive' : 'outline'
                      }>
                        {order.status === 'delivered' ? 'Livrată' :
                         order.status === 'shipped' ? 'Expediată' :
                         order.status === 'paid' ? 'Plătită' :
                         order.status === 'pending' ? 'În așteptare' :
                         order.status === 'cancelled' ? 'Anulată' : order.status}
                      </Badge>
                      <p className="font-bold">{formatPrice(order.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Listings Performance - Real Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Performanță Produse Active
            </CardTitle>
            <CardDescription>Vizualizări reale pentru produsele tale</CardDescription>
          </CardHeader>
          <CardContent>
            {activeListings.length > 0 ? (
              <div className="space-y-4">
                {activeListings.slice(0, 10).map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                        {listing.listing_images?.[0] ? (
                          <img 
                            src={listing.listing_images[0].image_url} 
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(listing.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold">{listing.views_count}</p>
                        <p className="text-muted-foreground">Vizualizări</p>
                      </div>
                      {listing.listing_type && listing.listing_type !== 'buy_now' && (
                        <Badge variant="secondary" className="gap-1">
                          <Gavel className="h-3 w-3" />
                          Licitație
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Niciun produs activ</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SellerAnalytics;