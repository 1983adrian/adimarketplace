import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Users, Clock, XCircle, Loader2, AlertTriangle, Ban } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useDeclineBid } from '@/hooks/useCancelOrder';
import { useListingBids } from '@/hooks/useBids';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface AuctionListing {
  id: string;
  title: string;
  starting_bid: number | null;
  reserve_price: number | null;
  auction_end_date: string | null;
  listing_type: string | null;
  is_active: boolean;
  is_sold: boolean;
  listing_images: { image_url: string; is_primary: boolean }[] | null;
  highest_bid: number | null;
  bid_count: number;
  last_bid_at: string | null;
  bidder_profile: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface AuctionCardProps {
  auction: AuctionListing;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const { formatPrice } = useCurrency();
  const declineBid = useDeclineBid();
  const { data: bids } = useListingBids(auction.id);
  
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  
  const isEnded = auction.auction_end_date && new Date(auction.auction_end_date) < new Date();
  const timeRemaining = auction.auction_end_date 
    ? formatDistanceToNow(new Date(auction.auction_end_date), { addSuffix: true, locale: ro })
    : null;
  
  // Get highest bid info
  const highestBid = bids?.[0];
  
  const handleDeclineBid = () => {
    if (!declineReason.trim() || !highestBid) return;
    
    declineBid.mutate(
      { 
        listingId: auction.id, 
        bidId: highestBid.id, 
        bidderId: highestBid.bidder_id,
        reason: declineReason 
      },
      { 
        onSuccess: () => {
          setDeclineOpen(false);
          setDeclineReason('');
        }
      }
    );
  };

  return (
    <Card className={`overflow-hidden ${isEnded ? 'opacity-75' : 'border-primary/20'}`}>
      <div className="flex">
        {/* Image */}
        <div className="w-24 h-24 flex-shrink-0 bg-muted">
          {auction.listing_images?.[0] && (
            <img 
              src={auction.listing_images[0].image_url} 
              alt={auction.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm line-clamp-1">{auction.title}</h3>
            <Badge 
              variant={isEnded ? 'secondary' : 'default'}
              className={`text-xs flex-shrink-0 ${!isEnded ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              {isEnded ? 'Încheiată' : 'Activă'}
            </Badge>
          </div>
          
          {/* Bid info */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cea mai mare ofertă:</span>
              <span className="font-bold text-primary">
                {auction.highest_bid ? formatPrice(auction.highest_bid) : 'Fără oferte'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {auction.bid_count} oferte
              </span>
              {timeRemaining && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeRemaining}
                </span>
              )}
            </div>
            
            {/* Latest bidder */}
            {auction.bidder_profile && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded text-xs">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {auction.bidder_profile.display_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  Ultima ofertă de <strong>{auction.bidder_profile.display_name || auction.bidder_profile.username || 'Utilizator'}</strong>
                </span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" asChild className="flex-1 h-7 text-xs">
              <Link to={`/listing/${auction.id}`}>Vezi Detalii</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link to={`/edit-listing/${auction.id}`}>
                <Pencil className="h-3 w-3" />
              </Link>
            </Button>
            
            {/* Decline Bid Button - only show if there are bids and auction is active */}
            {!isEnded && auction.bid_count > 0 && highestBid && (
              <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-7 text-xs">
                    <Ban className="h-3 w-3 mr-1" />
                    Refuză
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Refuză Oferta
                    </DialogTitle>
                    <DialogDescription>
                      Ești sigur că vrei să refuzi această ofertă? Ofertantul va fi notificat.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="text-sm"><strong>Produs:</strong> {auction.title}</p>
                      <p className="text-sm"><strong>Ofertă:</strong> {formatPrice(highestBid.amount)}</p>
                      <p className="text-sm"><strong>Ofertant:</strong> {highestBid.bidder_profile?.display_name || 'Utilizator'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="decline-reason">Motivul refuzului *</Label>
                      <Textarea
                        id="decline-reason"
                        placeholder="Explică de ce refuzi oferta (ex: preț prea mic, cumpărător suspect...)"
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeclineOpen(false)}>
                      Înapoi
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleDeclineBid}
                      disabled={!declineReason.trim() || declineBid.isPending}
                    >
                      {declineBid.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Confirmă Refuzul
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
