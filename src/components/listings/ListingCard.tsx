import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Truck, Gavel, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListingWithImages, ItemCondition } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/VerifiedBadge';

import { useSellerRating } from '@/hooks/useReviews';
import { ShareListingDialog } from '@/components/listings/ShareListingDialog';

interface ListingCardProps {
  listing: ListingWithImages;
}

// Condition labels will use translation function - defined inside component

const conditionStyles: Record<ItemCondition, string> = {
  new: 'bg-success text-success-foreground',
  like_new: 'bg-primary text-primary-foreground',
  good: 'bg-secondary text-secondary-foreground',
  fair: 'bg-muted text-muted-foreground',
  poor: 'bg-muted text-muted-foreground',
};

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { user } = useAuth();
  const { data: isFavorite } = useIsFavorite(listing.id, user?.id);
  const toggleFavorite = useToggleFavorite();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { playFavoriteSound } = useNotificationSound();
  const navigate = useNavigate();

  // Condition labels with translation
  const conditionLabels: Record<ItemCondition, string> = {
    new: t('condition.new'),
    like_new: t('condition.like_new'),
    good: t('condition.good'),
    fair: t('condition.fair'),
    poor: t('condition.poor'),
  };

  const primaryImage = listing.listing_images?.find((img) => img.is_primary) || listing.listing_images?.[0];
  const imageUrl = primaryImage?.image_url || '/placeholder.svg';
  const isAuction = (listing as any).listing_type === 'auction' || (listing as any).listing_type === 'both';
  const isVerified = (listing as any).profiles?.is_verified;
  
  // Get real seller rating from database
  const { data: sellerRating } = useSellerRating(listing.seller_id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({
        title: t('listing.loginToFavorite'),
        description: t('listing.loginToFavoriteDesc'),
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    toggleFavorite.mutate({
      listingId: listing.id,
      userId: user.id,
      isFavorite: !!isFavorite,
    }, {
      onSuccess: () => {
        // Play favorite sound when adding to favorites
        if (!isFavorite) {
          playFavoriteSound();
        }
        toast({
          title: isFavorite ? t('listing.removedFromFavorites') : t('listing.addedToFavorites'),
          description: isFavorite 
            ? t('listing.removedFromFavoritesDesc')
            : t('listing.addedToFavoritesDesc'),
        });
      },
      onError: () => {
        toast({
          title: t('listing.errorSaving'),
          description: t('listing.errorSavingDesc'),
          variant: "destructive",
        });
      }
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const primaryImage = listing.listing_images?.find((img) => img.is_primary) || listing.listing_images?.[0];
    
    addItem({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      image_url: primaryImage?.image_url || '/placeholder.svg',
      seller_id: listing.seller_id,
    });
    
    toast({
      title: t('listing.addedToCart'),
      description: listing.title,
    });
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden hover-scale cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-card-hover h-full flex flex-col bg-card transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={listing.title}
            width={400}
            height={500}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== '/placeholder.svg') {
                target.src = '/placeholder.svg';
              }
            }}
          />
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-card/80 backdrop-blur-sm shadow-sm hover:bg-card transition-all',
              isFavorite && 'text-destructive'
            )}
            onClick={handleToggleFavorite}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </Button>
          
          {/* Share Button for seller's own listings */}
          {user?.id === listing.seller_id && (
            <div onClick={(e) => e.preventDefault()}>
              <ShareListingDialog
                listingId={listing.id}
                listingTitle={listing.title}
                listingPrice={listing.price}
                listingImage={imageUrl}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-12 right-2 h-8 w-8 rounded-full bg-emerald-500/90 backdrop-blur-sm shadow-sm hover:bg-emerald-600 text-white transition-all"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </ShareListingDialog>
            </div>
          )}
          
          {/* Condition Badge */}
          <Badge className={cn('absolute bottom-1.5 left-1.5 text-[10px] px-1.5 py-0 h-4 font-medium', conditionStyles[listing.condition])}>
            {conditionLabels[listing.condition]}
          </Badge>
          
          {/* Badges Row - Stock, shipping */}
          <div className="absolute top-2 left-2 flex flex-col gap-0.5">
            {listing.quantity && listing.quantity > 1 && (
              <div className="flex items-center gap-0.5 bg-blue-600/90 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold leading-tight">
                📦 {listing.quantity} {t('listing.inStock')}
              </div>
            )}
            {listing.quantity === 1 && (
              <div className="flex items-center gap-0.5 bg-orange-600/90 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold leading-tight animate-pulse">
                🔥 {t('listing.lastOne')}
              </div>
            )}
            {listing.shipping_cost === 0 && (
              <div className="flex items-center gap-0.5 bg-success/90 text-success-foreground px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight">
                <Truck className="h-2.5 w-2.5" />
                {t('listing.freeShipping')}
              </div>
            )}
          </div>
          
          {/* Verified Badge - Bottom Left */}
          <div className="absolute bottom-2 right-2">
            <VerifiedBadge userId={listing.seller_id} size="sm" showTooltip={false} />
          </div>
        </div>
        
        {/* Content */}
        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col gap-1.5 overflow-hidden">
          {/* Title */}
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {listing.title}
          </h3>
          
          {/* Real Seller Rating from Database */}
          {sellerRating && sellerRating.count > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={cn(
                      'h-3.5 w-3.5',
                      star <= Math.round(sellerRating.average) ? 'text-accent fill-accent' : 'text-muted-foreground'
                    )} 
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({sellerRating.count})</span>
            </div>
          )}
          
          {/* Price & Buy Button */}
          <div className="mt-auto pt-2 space-y-1.5">
            <p className="text-lg md:text-xl font-bold text-foreground text-center truncate">
              {formatPrice(listing.price, ((listing as any).price_currency || 'RON') as any)}
            </p>
            
            <Button 
              size="sm" 
              className={cn(
                "w-full gap-1 font-medium text-[11px] sm:text-xs justify-center px-2 min-w-0 overflow-hidden",
                isAuction 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "gradient-primary text-primary-foreground"
              )}
              onClick={handleAddToCart}
            >
              {isAuction ? (
                <>
                  <Gavel className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t('listing.bid')}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t('listing.addToCart')}</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
