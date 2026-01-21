import React from 'react';
import { Truck, Clock, Banknote, CheckCircle2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export interface CourierOption {
  id: string;
  name: string;
  logo: string;
  deliveryTime: string;
  codFeePercent: number;
  codFixedFee: number;
  baseShippingCost: number;
  features: string[];
}

export const ROMANIAN_COURIERS: CourierOption[] = [
  {
    id: 'fan_courier',
    name: 'FAN Courier',
    logo: '🚚',
    deliveryTime: '1-2 zile lucrătoare',
    codFeePercent: 1.5,
    codFixedFee: 3,
    baseShippingCost: 18,
    features: ['Cel mai popular', 'Ramburs rapid'],
  },
  {
    id: 'cargus',
    name: 'Cargus',
    logo: '📦',
    deliveryTime: '1-2 zile lucrătoare',
    codFeePercent: 2,
    codFixedFee: 5,
    baseShippingCost: 16,
    features: ['Easybox disponibil'],
  },
  {
    id: 'sameday',
    name: 'Sameday',
    logo: '⚡',
    deliveryTime: '1-2 zile lucrătoare',
    codFeePercent: 2,
    codFixedFee: 4,
    baseShippingCost: 17,
    features: ['Easybox', 'Livrare rapidă'],
  },
  {
    id: 'dpd',
    name: 'DPD Romania',
    logo: '🔴',
    deliveryTime: '2-3 zile lucrătoare',
    codFeePercent: 1.5,
    codFixedFee: 4,
    baseShippingCost: 19,
    features: ['Rețea europeană'],
  },
  {
    id: 'gls',
    name: 'GLS Romania',
    logo: '🟡',
    deliveryTime: '2-3 zile lucrătoare',
    codFeePercent: 2,
    codFixedFee: 3,
    baseShippingCost: 18,
    features: ['Flexibilitate livrare'],
  },
];

interface RomanianCouriersProps {
  selectedCourier: string;
  onCourierChange: (courierId: string) => void;
  productPrice: number;
  isCOD: boolean;
}

export const RomanianCouriers: React.FC<RomanianCouriersProps> = ({
  selectedCourier,
  onCourierChange,
  productPrice,
  isCOD,
}) => {
  const calculateTotalCost = (courier: CourierOption) => {
    if (isCOD) {
      const codFee = (productPrice * courier.codFeePercent) / 100 + courier.codFixedFee;
      return courier.baseShippingCost + codFee;
    }
    return courier.baseShippingCost;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-5 w-5 text-primary" />
        <h4 className="font-medium">Alege Curierul</h4>
        {isCOD && (
          <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-800 border-amber-300">
            <Banknote className="h-3 w-3 mr-1" />
            Ramburs inclus
          </Badge>
        )}
      </div>

      <RadioGroup value={selectedCourier} onValueChange={onCourierChange} className="space-y-3">
        {ROMANIAN_COURIERS.map((courier) => {
          const totalCost = calculateTotalCost(courier);
          const isSelected = selectedCourier === courier.id;

          return (
            <div
              key={courier.id}
              className={`relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
              onClick={() => onCourierChange(courier.id)}
            >
              {isSelected && (
                <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary" />
              )}
              
              <div className="flex items-center gap-4">
                <RadioGroupItem value={courier.id} id={courier.id} className="sr-only" />
                
                <div className="text-3xl">{courier.logo}</div>
                
                <div className="space-y-1">
                  <Label htmlFor={courier.id} className="cursor-pointer font-semibold text-base">
                    {courier.name}
                  </Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{courier.deliveryTime}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {courier.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs py-0">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-lg">{totalCost.toFixed(2)} RON</div>
                {isCOD && (
                  <div className="text-xs text-muted-foreground">
                    Transport: {courier.baseShippingCost} RON
                    <br />
                    + Comision: {courier.codFeePercent}% + {courier.codFixedFee} RON
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};
