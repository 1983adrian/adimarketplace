import React from 'react';
import { Banknote, Truck, Calculator, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ROMANIAN_COURIERS, CourierOption } from './RomanianCouriers';

interface CODSummaryProps {
  productPrice: number;
  selectedCourier: string;
  codFees: {
    percentage: number;
    fixed: number;
    transport: number;
  };
}

export const CODSummary: React.FC<CODSummaryProps> = ({
  productPrice,
  selectedCourier,
  codFees,
}) => {
  const courier = ROMANIAN_COURIERS.find(c => c.id === selectedCourier) || ROMANIAN_COURIERS[0];
  
  // Use listing COD fees if available, otherwise use courier defaults
  const feePercent = codFees.percentage || courier.codFeePercent;
  const fixedFee = codFees.fixed || courier.codFixedFee;
  const transportFee = codFees.transport || courier.baseShippingCost;

  const percentageFee = (productPrice * feePercent) / 100;
  const totalCODFee = percentageFee + fixedFee + transportFee;
  const totalToPay = productPrice + totalCODFee;
  const sellerReceives = productPrice - percentageFee - fixedFee;

  return (
    <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Banknote className="h-5 w-5 text-amber-600" />
          Detalii Plată la Livrare
          <Badge className="ml-auto bg-amber-500 text-white">
            {courier.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <span className="text-muted-foreground">Preț produs:</span>
          <span className="text-right font-medium">{productPrice.toFixed(2)} RON</span>
          
          <span className="text-muted-foreground">Comision ramburs ({feePercent}%):</span>
          <span className="text-right text-amber-600">+{percentageFee.toFixed(2)} RON</span>
          
          <span className="text-muted-foreground">Taxă fixă ramburs:</span>
          <span className="text-right text-amber-600">+{fixedFee.toFixed(2)} RON</span>
          
          <span className="text-muted-foreground flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            Transport COD:
          </span>
          <span className="text-right text-amber-600">+{transportFee.toFixed(2)} RON</span>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-base">Total de plătit curierului:</span>
            <span className="font-bold text-xl text-amber-700">{totalToPay.toFixed(2)} RON</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Vânzătorul primește:</span>
            <span className="text-green-600 font-medium">{sellerReceives.toFixed(2)} RON</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Pregătește suma exactă în numerar. Curierul nu are obligația să dea rest. 
            Vei primi confirmarea pe email după expediere.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
