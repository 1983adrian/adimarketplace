import React from 'react';
import { Banknote, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CODBadgeProps {
  enabled: boolean;
  productPrice: number;
  feePercentage?: number;
  fixedFee?: number;
  transportFee?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md';
}

export const CODBadge: React.FC<CODBadgeProps> = ({
  enabled,
  productPrice,
  feePercentage = 2.5,
  fixedFee = 5,
  transportFee = 0,
  showDetails = true,
  size = 'sm',
}) => {
  if (!enabled) return null;

  // Calculate total COD cost
  const percentageFee = (productPrice * feePercentage) / 100;
  const totalCODFee = percentageFee + fixedFee + transportFee;
  const totalBuyerPays = productPrice + totalCODFee;

  if (!showDetails) {
    return (
      <Badge 
        variant="outline" 
        className="gap-1 bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/20"
      >
        <Banknote className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
        <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>Ramburs</span>
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="gap-1 bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/20 cursor-help"
          >
            <Banknote className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
            <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>
              Ramburs +{totalCODFee.toFixed(0)} RON
            </span>
            <Info className="h-3 w-3 opacity-60" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3" side="top">
          <div className="space-y-2">
            <p className="font-semibold text-sm">Plată la Livrare (Ramburs)</p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preț produs:</span>
                <span>{productPrice.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxe ramburs:</span>
                <span className="text-amber-600">+{totalCODFee.toFixed(2)} RON</span>
              </div>
              <hr className="my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total de plătit:</span>
                <span>{totalBuyerPays.toFixed(2)} RON</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Plătești în numerar curierului la primirea coletului.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
