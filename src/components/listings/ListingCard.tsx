import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListingWithImages, ItemCondition } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden hover-lift cursor-pointer border-border/50 hover:border-primary/30">
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
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatPrice(listing.price)}
          </p>
          {listing.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
              <MapPin className="h-3 w-3" />
              {listing.location}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
