import React from 'react';
import { Eye, EyeOff, Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useIsInWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from '@/hooks/useWatchlist';
import { useNavigate } from 'react-router-dom';

interface WatchlistButtonProps {
  listingId: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export const WatchlistButton = ({ listingId, variant = 'icon', className }: WatchlistButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: isInWatchlist, isLoading } = useIsInWatchlist(listingId);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (isInWatchlist) {
      removeFromWatchlist.mutate(listingId);
    } else {
      addToWatchlist.mutate({ listingId });
    }
  };

  const isProcessing = addToWatchlist.isPending || removeFromWatchlist.isPending;

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={className}
              onClick={handleClick}
              disabled={isLoading || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isInWatchlist ? (
                <Eye className="h-4 w-4 text-primary" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isInWatchlist ? 'Eliminare din Watchlist' : 'Adaugă în Watchlist'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={isInWatchlist ? 'default' : 'outline'}
      className={className}
      onClick={handleClick}
      disabled={isLoading || isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isInWatchlist ? (
        <Bell className="h-4 w-4 mr-2" />
      ) : (
        <Eye className="h-4 w-4 mr-2" />
      )}
      {isInWatchlist ? 'În Watchlist' : 'Adaugă în Watchlist'}
    </Button>
  );
};
