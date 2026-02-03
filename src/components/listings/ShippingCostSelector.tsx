import React from 'react';
import { Truck, Package, MapPin, Check, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Courier rates based on real market prices for standard parcels (up to 5kg)
export const COURIER_RATES = {
  RO: [
    {
      id: 'fan_courier',
      name: 'FAN Courier',
      logo: '🚚',
      standardCost: 18, // RON converted to approx £3.50
      gbpCost: 3.50,
      deliveryTime: '1-2 zile',
      description: 'Cel mai popular curier din România',
    },
    {
      id: 'sameday',
      name: 'Sameday',
      logo: '📦',
      standardCost: 16,
      gbpCost: 3.20,
      deliveryTime: '1-2 zile',
      description: 'Livrare rapidă + Easybox',
    },
    {
      id: 'cargus',
      name: 'Cargus',
      logo: '📮',
      standardCost: 15,
      gbpCost: 3.00,
      deliveryTime: '2-3 zile',
      description: 'Opțiune economică',
    },
    {
      id: 'dpd_ro',
      name: 'DPD România',
      logo: '🔴',
      standardCost: 20,
      gbpCost: 4.00,
      deliveryTime: '1-2 zile',
      description: 'Serviciu premium',
    },
    {
      id: 'gls_ro',
      name: 'GLS România',
      logo: '🟡',
      standardCost: 17,
      gbpCost: 3.40,
      deliveryTime: '2-3 zile',
      description: 'Rețea europeană',
    },
  ],
  UK: [
    {
      id: 'royal_mail',
      name: 'Royal Mail',
      logo: '👑',
      standardCost: 4.50,
      gbpCost: 4.50,
      deliveryTime: '2-3 days',
      description: 'Standard UK delivery',
    },
    {
      id: 'evri',
      name: 'Evri (Hermes)',
      logo: '📬',
      standardCost: 3.49,
      gbpCost: 3.49,
      deliveryTime: '3-5 days',
      description: 'Budget-friendly option',
    },
    {
      id: 'dpd_uk',
      name: 'DPD UK',
      logo: '🔴',
      standardCost: 6.99,
      gbpCost: 6.99,
      deliveryTime: '1-2 days',
      description: 'Next day available',
    },
    {
      id: 'yodel',
      name: 'Yodel',
      logo: '📦',
      standardCost: 4.99,
      gbpCost: 4.99,
      deliveryTime: '2-3 days',
      description: 'Reliable tracking',
    },
    {
      id: 'parcelforce',
      name: 'Parcelforce',
      logo: '🚛',
      standardCost: 8.99,
      gbpCost: 8.99,
      deliveryTime: '1-2 days',
      description: 'Express service',
    },
  ],
};

// Free shipping option
export const FREE_SHIPPING = {
  id: 'free',
  name: 'Livrare Gratuită',
  logo: '🎁',
  standardCost: 0,
  gbpCost: 0,
  deliveryTime: '',
  description: 'Costul livrării este inclus în prețul produsului',
};

interface ShippingCostSelectorProps {
  country: 'RO' | 'UK' | string;
  selectedCourier: string;
  onCourierChange: (courierId: string, cost: number) => void;
  allowFreeShipping?: boolean;
}

export const ShippingCostSelector: React.FC<ShippingCostSelectorProps> = ({
  country,
  selectedCourier,
  onCourierChange,
  allowFreeShipping = true,
}) => {
  const countryKey = country === 'RO' || country === 'România' ? 'RO' : 'UK';
  const couriers = COURIER_RATES[countryKey] || COURIER_RATES.UK;

  const handleSelect = (courierId: string) => {
    if (courierId === 'free') {
      onCourierChange('free', 0);
      return;
    }
    
    const courier = couriers.find(c => c.id === courierId);
    if (courier) {
      onCourierChange(courierId, courier.gbpCost);
    }
  };

  const getSelectedCourierInfo = () => {
    if (selectedCourier === 'free') return FREE_SHIPPING;
    return couriers.find(c => c.id === selectedCourier);
  };

  const selectedInfo = getSelectedCourierInfo();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Metodă de Livrare *
        </Label>
        <Badge variant="outline" className="gap-1">
          <MapPin className="h-3 w-3" />
          {countryKey === 'RO' ? 'România' : 'UK'}
        </Badge>
      </div>

      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          Prețurile de livrare sunt fixe și bazate pe tarifele reale ale curierilor pentru colete standard (până la 5kg).
          Aceasta protejează cumpărătorii de suprataxare.
        </AlertDescription>
      </Alert>

      <RadioGroup
        value={selectedCourier}
        onValueChange={handleSelect}
        className="grid gap-3"
      >
        {/* Free Shipping Option */}
        {allowFreeShipping && (
          <div
            className={`relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedCourier === 'free'
                ? 'border-green-500 bg-green-500/5'
                : 'border-border hover:border-green-500/50'
            }`}
            onClick={() => handleSelect('free')}
          >
            <RadioGroupItem value="free" id="courier-free" className="sr-only" />
            <div className="text-2xl">{FREE_SHIPPING.logo}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">{FREE_SHIPPING.name}</span>
                <Badge className="bg-green-500">Recomandat</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{FREE_SHIPPING.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">£0.00</p>
            </div>
            {selectedCourier === 'free' && (
              <Check className="absolute top-2 right-2 h-5 w-5 text-green-500" />
            )}
          </div>
        )}

        {/* Courier Options */}
        {couriers.map((courier) => (
          <div
            key={courier.id}
            className={`relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedCourier === courier.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleSelect(courier.id)}
          >
            <RadioGroupItem value={courier.id} id={`courier-${courier.id}`} className="sr-only" />
            <div className="text-2xl">{courier.logo}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{courier.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{courier.description}</p>
              {courier.deliveryTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  ⏱️ {courier.deliveryTime}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">£{courier.gbpCost.toFixed(2)}</p>
              {countryKey === 'RO' && (
                <p className="text-xs text-muted-foreground">~{courier.standardCost} RON</p>
              )}
            </div>
            {selectedCourier === courier.id && (
              <Check className="absolute top-2 right-2 h-5 w-5 text-primary" />
            )}
          </div>
        ))}
      </RadioGroup>

      {/* Selected Summary */}
      {selectedInfo && (
        <Card className="bg-muted/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{selectedInfo.logo}</span>
                <span className="font-medium">{selectedInfo.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">
                  {selectedInfo.gbpCost === 0 ? (
                    <span className="text-green-600">Gratuit</span>
                  ) : (
                    `£${selectedInfo.gbpCost.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper to get courier cost by ID
export const getCourierCost = (courierId: string, country: 'RO' | 'UK'): number => {
  if (courierId === 'free') return 0;
  
  const couriers = COURIER_RATES[country] || COURIER_RATES.UK;
  const courier = couriers.find(c => c.id === courierId);
  return courier?.gbpCost || 0;
};

// Helper to get courier name by ID
export const getCourierName = (courierId: string, country: 'RO' | 'UK'): string => {
  if (courierId === 'free') return 'Livrare Gratuită';
  
  const couriers = COURIER_RATES[country] || COURIER_RATES.UK;
  const courier = couriers.find(c => c.id === courierId);
  return courier?.name || 'Unknown';
};
