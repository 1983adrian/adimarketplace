import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Heart, ShoppingCart, Gavel } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

// Sub-component for favorite button
const FavoriteButton: React.FC<{ listingId: string; userId?: string }> = ({ listingId, userId }) => {
  const { data: isFavorite } = useIsFavorite(listingId, userId);
  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    toggleFavorite.mutate({
      listingId,
      userId,
      isFavorite: !!isFavorite,
    });
  };

  if (!userId) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background",
        isFavorite && "text-destructive"
      )}
      onClick={handleToggleFavorite}
    >
      <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
    </Button>
  );
};

interface PromotedGridProps {
  listings: any[];
  conditionLabels: Record<string, string>;
  t: (key: string) => string;
}

export const PromotedGrid: React.FC<PromotedGridProps> = ({
  listings,
  conditionLabels,
  t,
}) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {listings.map((listing) => {
        const primaryImage = listing.listing_images?.find((img: any) => img.is_primary) || listing.listing_images?.[0];
        const isAuction = listing.listing_type === 'auction' || listing.listing_type === 'both';

        const handleAddToCart = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          addItem({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            image_url: primaryImage?.image_url || '/placeholder.svg',
            seller_id: listing.seller_id,
          });
        };

        const handleBuyNow = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = `/checkout?listing=${listing.id}`;
        };

        return (
          <Link key={listing.id} to={`/listing/${listing.id}`}>
            <Card className="group overflow-hidden hover-lift cursor-pointer border-primary/20 hover:border-primary/50 bg-background/80 backdrop-blur-sm relative h-full flex flex-col">
              {/* Featured badge only - auction badge shown in ListingCard */}
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  {t('home.featured')}
                </Badge>
              </div>
              
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={primaryImage?.image_url || '/placeholder.svg'}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <FavoriteButton listingId={listing.id} userId={user?.id} />
                <Badge className="absolute bottom-2 left-2 bg-secondary text-secondary-foreground text-xs">
                  {conditionLabels[listing.condition]}
                </Badge>
                <div className="absolute bottom-2 right-2">
                  <VerifiedBadge userId={listing.seller_id} size="sm" showTooltip={true} />
                </div>
              </div>
              
              <CardContent className="p-3 flex-1 flex flex-col gap-1">
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {listing.title}
                </h3>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(listing.price, ((listing as any).price_currency || 'RON') as any)}
                </p>
                
                {/* Action Buttons - Always Visible */}
                <div className="flex gap-1 mt-auto pt-1">
                  {isAuction ? (
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1 text-xs h-8 bg-orange-500 hover:bg-orange-600"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/listing/${listing.id}`;
                      }}
                    >
                      <Gavel className="h-3 w-3" />
                      Licitează
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1 text-xs h-8"
                        onClick={handleBuyNow}
                      >
                        Cumpără
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 px-2"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default PromotedGrid;
