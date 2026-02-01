import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, ExternalLink, User, Star, Calendar, 
  Shield, ShoppingCart, Store, Ban, Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ConversationDetailsProps {
  conversation: any;
  currentUserId: string;
}

export const ConversationDetails: React.FC<ConversationDetailsProps> = ({
  conversation,
  currentUserId,
}) => {
  const { formatPrice } = useCurrency();
  
  const isBuyer = conversation.buyer_id === currentUserId;
  const otherUser = isBuyer ? conversation.seller : conversation.buyer;
  const listing = conversation.listings;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Product Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Produs
        </h3>
        
        <Link to={`/listing/${listing?.id}`} className="block group">
          <div className="rounded-xl overflow-hidden bg-muted aspect-square mb-3">
            {listing?.listing_images?.[0]?.image_url ? (
              <img 
                src={listing.listing_images[0].image_url}
                alt={listing?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
            {listing?.title || 'Produs necunoscut'}
          </h4>
        </Link>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {listing?.price ? formatPrice(listing.price) : '-'}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {listing?.condition || 'N/A'}
          </Badge>
        </div>
        
        <Button asChild variant="outline" size="sm" className="w-full mt-3">
          <Link to={`/listing/${listing?.id}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Vezi produsul
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Other User Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {isBuyer ? 'Vânzător' : 'Cumpărător'}
        </h3>
        
        <Link to={`/seller/${otherUser?.user_id}`} className="flex items-center gap-3 group">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarImage src={otherUser?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              {getInitials(otherUser?.display_name || otherUser?.username)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
              {otherUser?.display_name || otherUser?.username || 'Utilizator'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {otherUser?.is_verified && (
                <Badge variant="secondary" className="text-[10px] px-1.5 gap-1">
                  <Shield className="h-3 w-3" />
                  Verificat
                </Badge>
              )}
              {otherUser?.average_rating && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  {otherUser.average_rating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </Link>
        
        <Button asChild variant="outline" size="sm" className="w-full mt-3">
          <Link to={`/seller/${otherUser?.user_id}`}>
            <User className="h-4 w-4 mr-2" />
            Vezi profilul
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Conversation Info */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Detalii conversație
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Rolul tău</span>
            <Badge variant={isBuyer ? 'default' : 'secondary'} className="text-[10px]">
              {isBuyer ? (
                <>
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Cumpărător
                </>
              ) : (
                <>
                  <Store className="h-3 w-3 mr-1" />
                  Vânzător
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Început la</span>
            <span className="text-xs">
              {format(new Date(conversation.created_at), 'dd MMM yyyy', { locale: ro })}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge 
              variant={conversation.status === 'active' ? 'default' : 'secondary'}
              className="text-[10px]"
            >
              {conversation.status === 'active' ? 'Activ' : 
               conversation.status === 'closed' ? 'Închis' : 'Blocat'}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground">
          <Flag className="h-4 w-4 mr-2" />
          Raportează utilizatorul
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
          <Ban className="h-4 w-4 mr-2" />
          Blochează utilizatorul
        </Button>
      </div>
    </div>
  );
};

export default ConversationDetails;
