import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListingWithImages, ItemCondition } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: ListingWithImages;
}

const conditionLabels: Record<ItemCondition, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const conditionColors: Record<ItemCondition, string> = {
  new: 'bg-success text-success-foreground',
  like_new: 'bg-primary text-primary-foreground',
  good: 'bg-secondary text-secondary-foreground',
  fair: 'bg-accent text-accent-foreground',
  poor: 'bg-muted text-muted-foreground',
};

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { user } = useAuth();
  const { data: isFavorite } = useIsFavorite(listing.id, user?.id);
  const toggleFavorite = useToggleFavorite();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const primaryImage = listing.listing_images?.find((img) => img.is_primary) || listing.listing_images?.[0];
  const imageUrl = primaryImage?.image_url || '/placeholder.svg';

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    toggleFavorite.mutate({
      listingId: listing.id,
      userId: user.id,
      isFavorite: !!isFavorite,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/checkout/${listing.id}`);
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden hover-lift cursor-pointer border-border/50 hover:border-primary/30 h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background',
                isFavorite && 'text-destructive'
              )}
              onClick={handleToggleFavorite}
            >
              <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
            </Button>
          )}
          <Badge className={cn('absolute bottom-2 left-2', conditionColors[listing.condition])}>
            {conditionLabels[listing.condition]}
          </Badge>
        </div>
        <CardContent className="p-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          {listing.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {listing.description}
            </p>
          )}
          {listing.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {listing.location}
            </p>
          )}
          <div className="mt-auto pt-3 space-y-2">
            <p className="text-lg md:text-xl font-bold text-primary">
              {formatPrice(listing.price)}
            </p>
            <Button 
              size="sm" 
              className="w-full gap-2"
              onClick={handleBuyNow}
            >
              <ShoppingCart className="h-4 w-4" />
              {t('listing.buyNow')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
