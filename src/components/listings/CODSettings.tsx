import React from 'react';
import { Banknote, Truck, Calculator, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CODSettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  feePercentage: string;
  onFeePercentageChange: (value: string) => void;
  fixedFee: string;
  onFixedFeeChange: (value: string) => void;
  transportFee: string;
  onTransportFeeChange: (value: string) => void;
  productPrice: number;
  sellerCountry?: string;
}

export const CODSettings: React.FC<CODSettingsProps> = ({
  enabled,
  onEnabledChange,
  feePercentage,
  onFeePercentageChange,
  fixedFee,
  onFixedFeeChange,
  transportFee,
  onTransportFeeChange,
  productPrice,
  sellerCountry,
}) => {
  // Only show for Romanian sellers
  const isRomanian = sellerCountry?.toLowerCase() === 'romania' || 
                      sellerCountry?.toLowerCase() === 'ro' ||
                      sellerCountry?.toLowerCase() === 'românia';

  if (!isRomanian) {
    return null;
  }

  // Calculate COD costs
  const feePercent = parseFloat(feePercentage) || 0;
  const fixedFeeNum = parseFloat(fixedFee) || 0;
  const transportFeeNum = parseFloat(transportFee) || 0;
  
  // Total COD fee = percentage of product + fixed fee + transport
  const percentageFee = (productPrice * feePercent) / 100;
  const totalCODFee = percentageFee + fixedFeeNum + transportFeeNum;
  const totalBuyerPays = productPrice + totalCODFee;
  const sellerReceives = productPrice - percentageFee - fixedFeeNum;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Plată la Livrare (Ramburs)</CardTitle>
          </div>
          <Switch 
            checked={enabled} 
            onCheckedChange={onEnabledChange}
          />
        </div>
        <CardDescription>
          Permite cumpărătorilor să plătească în numerar la primirea coletului
        </CardDescription>
      </CardHeader>
      
      {enabled && (
        <CardContent className="space-y-4">
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> Firma de curierat percepe comisioane pentru serviciul de ramburs. 
              Configurează taxele conform contractului tău cu curierul.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Percentage Fee */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="codFeePercent">Comision Ramburs (%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Procentul perceput de curier din valoarea rambursului (tipic 1-3%)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Input
                  id="codFeePercent"
                  type="number"
                  value={feePercentage}
                  onChange={(e) => onFeePercentageChange(e.target.value)}
                  placeholder="2.5"
                  min="0"
                  max="10"
                  step="0.1"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>

            {/* Fixed Fee */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="codFixedFee">Taxă Fixă Ramburs</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Taxa fixă per colet pentru serviciul de ramburs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">RON</span>
                <Input
                  id="codFixedFee"
                  type="number"
                  value={fixedFee}
                  onChange={(e) => onFixedFeeChange(e.target.value)}
                  placeholder="5"
                  min="0"
                  step="0.5"
                  className="pl-12"
                />
              </div>
            </div>

            {/* Transport Fee */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="codTransport">Cost Transport COD</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Costul transportului pentru livrare cu ramburs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">RON</span>
                <Input
                  id="codTransport"
                  type="number"
                  value={transportFee}
                  onChange={(e) => onTransportFeeChange(e.target.value)}
                  placeholder="20"
                  min="0"
                  step="1"
                  className="pl-12"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Calculator Preview */}
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Previzualizare Costuri Ramburs</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preț produs:</span>
                  <span className="font-medium">{productPrice.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comision {feePercent}%:</span>
                  <span className="text-amber-600">+{percentageFee.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxă fixă:</span>
                  <span className="text-amber-600">+{fixedFeeNum.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transport:</span>
                  <span className="text-amber-600">+{transportFeeNum.toFixed(2)} RON</span>
                </div>
              </div>
              
              <div className="space-y-2 border-l pl-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cumpărătorul plătește:</span>
                  <span className="font-bold text-lg">{totalBuyerPays.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tu primești:</span>
                  <span className="font-bold text-green-600">{sellerReceives.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Curier primește:</span>
                  <span className="text-amber-600">{totalCODFee.toFixed(2)} RON</span>
                </div>
              </div>
            </div>
          </div>

          <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Curierul va vira suma (produs - comisioane) în contul tău după livrare. Păstrează toate documentele pentru contabilitate.
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
};
