import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Heart, MessageCircle, Settings, Plus, Eye, DollarSign } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useMyListings } from '@/hooks/useListings';
import { useFavorites } from '@/hooks/useFavorites';
import { ListingGrid } from '@/components/listings/ListingGrid';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { data: myListings, isLoading: listingsLoading } = useMyListings(user?.id);
  const { data: favorites, isLoading: favoritesLoading } = useFavorites(user?.id);

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  const activeListings = myListings?.filter(l => l.is_active && !l.is_sold) || [];
  const soldListings = myListings?.filter(l => l.is_sold) || [];
  const totalViews = myListings?.reduce((acc, l) => acc + l.views_count, 0) || 0;
  const totalEarnings = soldListings.reduce((acc, l) => acc + l.price, 0);

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
              <h1 className="text-2xl font-bold">{profile?.display_name || 'Welcome!'}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/sell" className="gap-2">
                <Plus className="h-4 w-4" />
                New Listing
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{activeListings.length}</p>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
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
                  <p className="text-sm text-muted-foreground">Favorites</p>
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
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to="/favorites">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <Heart className="h-6 w-6 mb-2" />
                <CardTitle className="text-lg">My Favorites</CardTitle>
                <CardDescription>Items you've saved</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/messages">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <MessageCircle className="h-6 w-6 mb-2" />
                <CardTitle className="text-lg">Messages</CardTitle>
                <CardDescription>Chat with buyers & sellers</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/settings">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <Settings className="h-6 w-6 mb-2" />
                <CardTitle className="text-lg">Settings</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* My Listings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">My Listings</h2>
            <Button variant="ghost" asChild>
              <Link to="/sell">View All</Link>
            </Button>
          </div>
          {activeListings.length > 0 ? (
            <ListingGrid listings={activeListings.slice(0, 4)} isLoading={listingsLoading} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">Start selling by creating your first listing</p>
                <Button asChild>
                  <Link to="/sell">Create Listing</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
