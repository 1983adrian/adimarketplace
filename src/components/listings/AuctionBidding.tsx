import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Clock, Users, TrendingUp, AlertCircle, Loader2, ShoppingCart, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { useListingBids, useHighestBid, usePlaceBid } from '@/hooks/useBids';
import { useActiveBidderPlan } from '@/hooks/useUserSubscription';
import { supabase } from '@/integrations/supabase/client';

interface AuctionBiddingProps {
  listingId: string;
  startingBid: number;
  reservePrice?: number | null;
  buyNowPrice?: number | null;
  auctionEndDate: string;
  bidIncrement?: number;
  sellerId: string;
}

// Shipping cost estimate for auctions
const AUCTION_SHIPPING_COST = 5.99;

export const AuctionBidding: React.FC<AuctionBiddingProps> = ({
  listingId,
  startingBid,
  reservePrice,
  buyNowPrice,
  auctionEndDate,
  bidIncrement = 1,
  sellerId,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { data: bids, refetch: refetchBids } = useListingBids(listingId);
  const { data: highestBid, refetch: refetchHighest } = useHighestBid(listingId);
  const { data: bidderPlan, isLoading: bidderPlanLoading } = useActiveBidderPlan();
  const placeBid = usePlaceBid();

  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);

  // Calculate time remaining
  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(auctionEndDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Licitație încheiată');
        setIsEnded(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}z ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }

      // Anti-sniping: if less than 5 minutes left, show warning
      if (diff < 5 * 60 * 1000) {
        setTimeLeft(`⚡ ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auctionEndDate]);

  // Real-time updates for bids
  useEffect(() => {
    const channel = supabase
      .channel(`bids-${listingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `listing_id=eq.${listingId}`,
        },
        () => {
          refetchBids();
          refetchHighest();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId, refetchBids, refetchHighest]);

  const currentPrice = highestBid?.amount || startingBid;
  const minimumBid = currentPrice + bidIncrement;
  const reserveMet = !reservePrice || currentPrice >= reservePrice;
  const isOwner = user?.id === sellerId;
  const isWinning = user && highestBid?.bidder_id === user.id;

  const handlePlaceBid = async () => {
    if (!bidAmount || isNaN(parseFloat(bidAmount))) {
      toast({
        title: 'Sumă invalidă',
        description: 'Introdu o sumă validă pentru licitație.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(bidAmount);
    if (amount < minimumBid) {
      toast({
        title: 'Ofertă prea mică',
        description: `Licitația minimă este ${formatPrice(minimumBid)}`,
        variant: 'destructive',
      });
      return;
    }

    placeBid.mutate({ listingId, amount });
    setBidAmount('');
  };

  const handleQuickBid = () => {
    placeBid.mutate({ listingId, amount: minimumBid });
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gavel className="h-5 w-5 text-primary" />
            Licitație
          </CardTitle>
          <Badge 
            variant={isEnded ? 'secondary' : 'default'}
            className={isEnded ? '' : 'bg-green-500 hover:bg-green-600'}
          >
            {isEnded ? 'Încheiată' : 'Activă'}
          </Badge>
        </div>
        <CardDescription>
          Plasează oferta ta pentru a câștiga acest produs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Timp rămas:</span>
          </div>
          <span className={`font-mono font-bold ${timeLeft.includes('⚡') ? 'text-destructive' : ''}`}>
            {timeLeft}
          </span>
        </div>

        {/* Current Price */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">Oferta curentă</p>
          <p className="text-4xl font-bold text-primary">{formatPrice(currentPrice)}</p>
          {!reserveMet && reservePrice && (
            <p className="text-sm text-amber-600 mt-1">
              Rezerva nu a fost atinsă
            </p>
          )}
          {reserveMet && reservePrice && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Rezerva a fost atinsă
            </p>
          )}
        </div>

        {/* Bid Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{bids?.length || 0} oferte</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Pas minim: {formatPrice(bidIncrement)}</span>
          </div>
        </div>

        {/* User Status */}
        {isWinning && !isEnded && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              🎉 Ești cel mai mare ofertant! Așteaptă să vadă dacă altcineva licitează mai mult.
            </AlertDescription>
          </Alert>
        )}

        {/* Already highest bidder - cannot bid again */}
        {isWinning && !isEnded && user && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Nu poți licita din nou până când altcineva nu licitează mai mult decât tine.
            </AlertDescription>
          </Alert>
        )}

        {isOwner && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nu poți licita la propriul tău produs.
            </AlertDescription>
          </Alert>
        )}

        {/* Bidder subscription required */}
        {!isEnded && !isOwner && user && !bidderPlan && !bidderPlanLoading && (
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Abonament Licitator necesar!</strong> Pentru a licita, trebuie să activezi Abonamentul Licitator (11 LEI).
              <Button
                variant="link"
                className="p-0 h-auto ml-1"
                onClick={() => navigate('/seller-plans')}
              >
                Activează acum →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Bidding Form - hidden if no bidder plan or already winning */}
        {!isEnded && !isOwner && user && !isWinning && bidderPlan && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                <Input
                  type="number"
                  placeholder={`Min. ${minimumBid.toFixed(2)}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="pl-8"
                  min={minimumBid}
                  step={bidIncrement}
                />
              </div>
              <Button
                onClick={handlePlaceBid}
                disabled={placeBid.isPending}
                className="gap-2"
              >
                {placeBid.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Gavel className="h-4 w-4" />
                )}
                Licitează
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleQuickBid}
              disabled={placeBid.isPending}
            >
              Ofertă Rapidă: {formatPrice(minimumBid)}
            </Button>
          </div>
        )}

        {/* Login Prompt */}
        {!user && !isEnded && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Trebuie să fii autentificat pentru a licita.
            </AlertDescription>
          </Alert>
        )}

        {/* Buy Now Option with Shipping */}
        {buyNowPrice && !isEnded && !isOwner && (
          <div className="pt-4 border-t">
            <div className="text-center mb-2">
              <p className="text-2xl font-bold text-primary">{formatPrice(buyNowPrice)}</p>
              <p className="text-sm text-muted-foreground">+ {formatPrice(AUCTION_SHIPPING_COST)} livrare</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                Total: {formatPrice(buyNowPrice + AUCTION_SHIPPING_COST)}
              </p>
            </div>
            <Button 
              variant="default" 
              className="w-full gap-2" 
              size="lg"
              onClick={() => navigate(`/checkout?listing=${listingId}`)}
            >
              <ShoppingCart className="h-4 w-4" />
              Cumpără Acum
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Cumpără imediat fără să aștepți finalizarea licitației
            </p>
          </div>
        )}

        {/* Recent Bids */}
        {bids && bids.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Oferte Recente
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bids.slice(0, 5).map((bid, index) => (
                <div
                  key={bid.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    index === 0 ? 'bg-primary/10' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={bid.bidder_profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {bid.bidder_profile?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {bid.bidder_profile?.display_name || 'Utilizator'}
                    </span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Cel mai mare
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">{formatPrice(bid.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
