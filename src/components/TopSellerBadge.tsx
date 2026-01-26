import React from 'react';
import { Crown, Star } from 'lucide-react';
import { useIsTopSeller } from '@/hooks/useTopSellers';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TopSellerBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const TopSellerBadge: React.FC<TopSellerBadgeProps> = ({
  userId,
  size = 'md',
  showLabel = false,
  className,
}) => {
  const { data: isTopSeller, isLoading } = useIsTopSeller(userId);

  if (isLoading || !isTopSeller) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const containerClasses = {
    sm: 'gap-1 text-xs',
    md: 'gap-1.5 text-sm',
    lg: 'gap-2 text-base',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-lg shadow-amber-500/30 animate-pulse',
              containerClasses[size],
              className
            )}
          >
            <Crown className={cn(sizeClasses[size], 'drop-shadow-sm')} />
            {showLabel && <span>Top 10</span>}
            <Star className={cn(sizeClasses[size], 'fill-current')} />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            <span className="font-semibold">Vânzător Top 10</span>
          </div>
          <p className="text-xs opacity-90">Cele mai multe vânzări și rating ridicat</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TopSellerBadge;
