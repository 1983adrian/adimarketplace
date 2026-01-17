import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { ListingCard } from '@/components/listings/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: favorites, isLoading } = useFavorites(user?.id);

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const favoriteListings = favorites?.map(fav => fav.listings).filter(Boolean) || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-destructive fill-destructive" />
              Produsele mele favorite
            </h1>
            <p className="text-muted-foreground">
              {favoriteListings.length} {favoriteListings.length === 1 ? 'produs salvat' : 'produse salvate'}
            </p>
          </div>
        </div>

        {/* Favorites Grid */}
        {favoriteListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favoriteListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Nu ai produse favorite încă</h2>
              <p className="text-muted-foreground mb-6">
                Explorează marketplace-ul și apasă pe inimă pentru a salva produsele care îți plac.
              </p>
              <Button asChild>
                <Link to="/browse" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Explorează Produse
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
