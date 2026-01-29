import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Gavel } from 'lucide-react';
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
const FavoriteButton = React.forwardRef<HTMLButtonElement, { listingId: string; userId?: string }>(
  ({ listingId, userId }, ref) => {
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
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1.5 right-1.5 h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background",
          isFavorite && "text-destructive"
        )}
        onClick={handleToggleFavorite}
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </Button>
    );
  }
);
FavoriteButton.displayName = 'FavoriteButton';

interface PopularProductsGridProps {
  listings: any[];
  conditionLabels: Record<string, string>;
}

export const PopularProductsGrid: React.FC<PopularProductsGridProps> = ({
  listings,
  conditionLabels,
}) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
      {listings.slice(0, 15).map((listing) => {
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
            <Card className="group overflow-hidden cursor-pointer border-border bg-card hover:shadow-lg h-full flex flex-col transition-all duration-200 hover:-translate-y-1">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={primaryImage?.image_url || '/placeholder.svg'}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <FavoriteButton listingId={listing.id} userId={user?.id} />
                
                {/* Badges Row - Top Left */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                  <Badge 
                    variant="secondary" 
                    className="text-[9px] md:text-[10px] px-1.5 py-0.5"
                  >
                    {conditionLabels[listing.condition]}
                  </Badge>
                  {isAuction && (
                    <Badge className="bg-orange-500 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 flex items-center gap-0.5">
                      <Gavel className="h-2.5 w-2.5" />
                      Licitație
                    </Badge>
                  )}
                </div>
                
                {/* Verified Badge - Bottom Right */}
                <div className="absolute bottom-1.5 right-1.5">
                  <VerifiedBadge userId={listing.seller_id} size="sm" showTooltip={true} />
                </div>
              </div>
              <CardContent className="p-2 md:p-3 flex-1 flex flex-col gap-1">
                <h3 className="text-xs md:text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {listing.title}
                </h3>
                <span className="text-sm md:text-base font-bold text-primary">
                  {formatPrice(listing.price, ((listing as any).price_currency || 'RON') as any)}
                </span>
                
                {/* Action Buttons - Always Visible */}
                <div className="flex gap-1 mt-auto pt-1">
                  {isAuction ? (
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1 text-[10px] md:text-xs h-7 md:h-8 bg-orange-500 hover:bg-orange-600"
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
                        className="flex-1 gap-1 text-[10px] md:text-xs h-7 md:h-8"
                        onClick={handleBuyNow}
                      >
                        Cumpără
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 md:h-8 px-1.5 md:px-2"
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

export default PopularProductsGrid;
