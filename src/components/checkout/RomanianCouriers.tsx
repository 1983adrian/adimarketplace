import React from 'react';
import { Truck, Clock, Banknote, CheckCircle2, Box, MapPin } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export interface CourierOption {
  id: string;
  name: string;
  logo: string;
  deliveryTime: string;
  codFeePercent: number;
  codFixedFee: number;
  baseShippingCost: number;
  lockerShippingCost: number;
  features: string[];
  hasLocker: boolean;
  lockerName?: string;
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
    lockerShippingCost: 12,
    features: ['Cel mai popular', 'Ramburs rapid'],
    hasLocker: true,
    lockerName: 'FANbox',
  },
  {
    id: 'cargus',
    name: 'Cargus',
    logo: '📦',
    deliveryTime: '1-2 zile lucrătoare',
    codFeePercent: 2,
    codFixedFee: 5,
    baseShippingCost: 16,
    lockerShippingCost: 10,
    features: ['Ship & Go'],
    hasLocker: true,
    lockerName: 'Ship & Go',
  },
  {
    id: 'sameday',
    name: 'Sameday',
    logo: '⚡',
    deliveryTime: '1-2 zile lucrătoare',
    codFeePercent: 2,
    codFixedFee: 4,
    baseShippingCost: 17,
    lockerShippingCost: 9,
    features: ['Easybox', 'Livrare rapidă'],
    hasLocker: true,
    lockerName: 'Easybox',
  },
  {
    id: 'dpd',
    name: 'DPD Romania',
    logo: '🔴',
    deliveryTime: '2-3 zile lucrătoare',
    codFeePercent: 1.5,
    codFixedFee: 4,
    baseShippingCost: 19,
    lockerShippingCost: 14,
    features: ['Rețea europeană'],
    hasLocker: true,
    lockerName: 'DPD Pickup',
  },
  {
    id: 'gls',
    name: 'GLS Romania',
    logo: '🟡',
    deliveryTime: '2-3 zile lucrătoare',
    codFeePercent: 2,
    codFixedFee: 3,
    baseShippingCost: 18,
    lockerShippingCost: 13,
    features: ['Flexibilitate livrare'],
    hasLocker: false,
  },
];

export type DeliveryType = 'home' | 'locker';

interface RomanianCouriersProps {
  selectedCourier: string;
  onCourierChange: (courierId: string) => void;
  productPrice: number;
  isCOD: boolean;
  deliveryType: DeliveryType;
  onDeliveryTypeChange: (type: DeliveryType) => void;
}

export const RomanianCouriers: React.FC<RomanianCouriersProps> = ({
  selectedCourier,
  onCourierChange,
  productPrice,
  isCOD,
  deliveryType,
  onDeliveryTypeChange,
}) => {
  const calculateTotalCost = (courier: CourierOption) => {
    const baseCost = deliveryType === 'locker' ? courier.lockerShippingCost : courier.baseShippingCost;
    
    if (isCOD) {
      const codFee = (productPrice * courier.codFeePercent) / 100 + courier.codFixedFee;
      return baseCost + codFee;
    }
    return baseCost;
  };

  // Filter couriers based on delivery type
  const availableCouriers = deliveryType === 'locker' 
    ? ROMANIAN_COURIERS.filter(c => c.hasLocker)
    : ROMANIAN_COURIERS;

  // If current courier doesn't support locker, switch to first available
  React.useEffect(() => {
    if (deliveryType === 'locker') {
      const currentCourier = ROMANIAN_COURIERS.find(c => c.id === selectedCourier);
      if (!currentCourier?.hasLocker) {
        const firstLocker = availableCouriers[0];
        if (firstLocker) onCourierChange(firstLocker.id);
      }
    }
  }, [deliveryType, selectedCourier, onCourierChange, availableCouriers]);

  return (
    <div className="space-y-4">
      {/* Delivery Type Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
        <div className="flex items-center gap-3">
          {deliveryType === 'home' ? (
            <MapPin className="h-5 w-5 text-primary" />
          ) : (
            <Box className="h-5 w-5 text-orange-500" />
          )}
          <div>
            <Label className="font-medium">
              {deliveryType === 'home' ? 'Livrare la Adresă' : 'Ridicare din Easybox/Locker'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {deliveryType === 'home' 
                ? 'Curierul livrează la ușa ta'
                : 'Ridici coletul când îți convine, 24/7'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${deliveryType === 'home' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Adresă
          </span>
          <Switch
            checked={deliveryType === 'locker'}
            onCheckedChange={(checked) => onDeliveryTypeChange(checked ? 'locker' : 'home')}
          />
          <span className={`text-sm ${deliveryType === 'locker' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Locker
          </span>
        </div>
      </div>

      {/* Locker Benefits */}
      {deliveryType === 'locker' && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
            <span className="text-lg">💰</span>
            <p className="text-xs font-medium text-green-700 dark:text-green-300">Mai Ieftin</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200">
            <span className="text-lg">🕐</span>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Disponibil 24/7</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
            <span className="text-lg">🔐</span>
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Sigur</p>
          </div>
        </div>
      )}

      {/* Courier Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
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
          {availableCouriers.map((courier) => {
            const totalCost = calculateTotalCost(courier);
            const isSelected = selectedCourier === courier.id;
            const savingsVsHome = courier.baseShippingCost - courier.lockerShippingCost;

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
                      {deliveryType === 'locker' && courier.lockerName && (
                        <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-700 border-orange-300">
                          <Box className="h-3 w-3 mr-1" />
                          {courier.lockerName}
                        </Badge>
                      )}
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
                  {deliveryType === 'locker' && savingsVsHome > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      Economisești {savingsVsHome} RON
                    </div>
                  )}
                  {isCOD && (
                    <div className="text-xs text-muted-foreground">
                      + Comision: {courier.codFeePercent}% + {courier.codFixedFee} RON
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
};
