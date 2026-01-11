import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Eye, 
  ShoppingCart,
  Star,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useMyListings } from '@/hooks/useListings';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Sample data for charts - in real app, fetch from database
const salesData = [
  { month: 'Jan', sales: 120, views: 450 },
  { month: 'Feb', sales: 180, views: 620 },
  { month: 'Mar', sales: 150, views: 580 },
  { month: 'Apr', sales: 220, views: 780 },
  { month: 'May', sales: 280, views: 920 },
  { month: 'Jun', sales: 350, views: 1100 },
];

const categoryData = [
  { category: 'Electronics', sales: 45 },
  { category: 'Clothing', sales: 32 },
  { category: 'Home', sales: 18 },
  { category: 'Sports', sales: 12 },
  { category: 'Other', sales: 8 },
];

const SellerAnalytics = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { data: myListings } = useMyListings(user?.id);

  const activeListings = myListings?.filter(l => l.is_active && !l.is_sold) || [];
  const soldListings = myListings?.filter(l => l.is_sold) || [];
  const totalViews = myListings?.reduce((acc, l) => acc + l.views_count, 0) || 0;
  const totalEarnings = soldListings.reduce((acc, l) => acc + l.price, 0);
  const avgPrice = soldListings.length > 0 ? totalEarnings / soldListings.length : 0;

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
            <h1 className="text-3xl font-bold">Seller Analytics</h1>
            <p className="text-muted-foreground">Track your sales performance and growth</p>
          </div>
          <Button asChild>
            <Link to="/dashboard">{t('common.back')}</Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">£{totalEarnings.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items Sold</p>
                  <p className="text-2xl font-bold">{soldListings.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                <ArrowUp className="h-3 w-3" />
                <span>+5 this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-purple-600">
                <ArrowUp className="h-3 w-3" />
                <span>+18% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Sale Price</p>
                  <p className="text-2xl font-bold">£{avgPrice.toFixed(0)}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <span>Based on {soldListings.length} sales</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales & Views Trend
              </CardTitle>
              <CardDescription>Monthly performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sales by Category
              </CardTitle>
              <CardDescription>Distribution of your sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="category" type="category" className="text-xs" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Active Listings Performance
            </CardTitle>
            <CardDescription>How your current listings are performing</CardDescription>
          </CardHeader>
          <CardContent>
            {activeListings.length > 0 ? (
              <div className="space-y-4">
                {activeListings.slice(0, 5).map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">£{listing.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold">{listing.views_count}</p>
                        <p className="text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">4.8</span>
                        </div>
                        <p className="text-muted-foreground">Rating</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No active listings</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SellerAnalytics;
