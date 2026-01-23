import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, ShoppingCart, Star, Truck, CheckCircle, Gavel, Clock, BadgeCheck, Banknote } from 'lucide-react';
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
import { CODBadge } from '@/components/listings/CODBadge';

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

  const primaryImage = listing.listing_images?.find((img) => img.is_primary) || listing.listing_images?.[0];
  const imageUrl = primaryImage?.image_url || '/placeholder.svg';
  const isAuction = (listing as any).listing_type === 'auction' || (listing as any).listing_type === 'both';
  const isVerified = (listing as any).profiles?.is_verified;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Conectează-te pentru a salva favorite",
        description: "Trebuie să fii autentificat pentru a adăuga produse la favorite.",
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
          title: isFavorite ? "Eliminat din favorite" : "❤️ Adăugat la favorite",
          description: isFavorite 
            ? "Produsul a fost eliminat din lista ta de favorite."
            : "Produsul a fost salvat în favorite. Îl poți găsi în pagina Favorite.",
        });
      },
      onError: () => {
        toast({
          title: "Eroare",
          description: "Nu s-a putut salva produsul. Încearcă din nou.",
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
      title: "Adăugat în coș",
      description: listing.title,
    });
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden hover-scale cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-card-hover h-full flex flex-col bg-card transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Favorite Button - Always visible */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm shadow-sm hover:bg-card transition-all',
              isFavorite && 'text-destructive'
            )}
            onClick={handleToggleFavorite}
          >
            <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
          </Button>
          
          {/* Condition Badge */}
          <Badge className={cn('absolute bottom-2 left-2 font-medium', conditionStyles[listing.condition])}>
            {conditionLabels[listing.condition]}
          </Badge>
          
          {/* Badges Row */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <div className="flex items-center gap-1 bg-success text-success-foreground px-2 py-1 rounded-md text-xs font-medium">
              <Truck className="h-3 w-3" />
              Free Shipping
            </div>
            {isAuction && (
              <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                <Gavel className="h-3 w-3" />
                Licitație
              </div>
            )}
            {isVerified && (
              <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                <CheckCircle className="h-3 w-3" />
                Verificat
              </div>
            )}
            {(listing as any).cod_enabled && (
              <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                <Banknote className="h-3 w-3" />
                Ramburs
              </div>
            )}
            <VerifiedBadge userId={listing.seller_id} size="sm" showTooltip={false} />
          </div>
        </div>
        
        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col gap-2">
          {/* Title */}
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {listing.title}
          </h3>
          
          {/* Rating (mock for now) */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={cn(
                    'h-3.5 w-3.5',
                    star <= 4 ? 'text-accent fill-accent' : 'text-muted-foreground'
                  )} 
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">(42)</span>
          </div>
          
          {/* Location */}
          {listing.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{listing.location}</span>
            </p>
          )}
          
          {/* Price & Buy Button */}
          <div className="mt-auto pt-3 space-y-2">
            <div className="flex items-baseline gap-2">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {formatPrice(listing.price)}
              </p>
              {/* Optional crossed-out original price */}
              {listing.price > 50 && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(listing.price * 1.2)}
                </span>
              )}
            </div>
            
            <Button 
              size="sm" 
              className="w-full gap-2 gradient-primary text-primary-foreground font-medium"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              {t('listing.addToCart')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
