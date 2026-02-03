import React, { useState } from 'react';
import { CreditCard, Banknote, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'card' | 'cod';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  codAvailable: boolean;
  codFees?: {
    percentage: number;
    fixed: number;
    transport: number;
  };
  productPrice: number;
  onCardDetailsChange?: (details: CardDetails) => void;
}

export interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

// Card brand logos
const CardBrands = () => (
  <div className="flex items-center gap-2">
    {/* Visa */}
    <div className="w-10 h-6 bg-white rounded border flex items-center justify-center">
      <span className="text-[10px] font-bold text-blue-600">VISA</span>
    </div>
    {/* Mastercard */}
    <div className="w-10 h-6 bg-white rounded border flex items-center justify-center">
      <div className="flex">
        <div className="w-3 h-3 rounded-full bg-red-500 -mr-1"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80"></div>
      </div>
    </div>
    {/* MangoPay badge */}
    <div className="w-16 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
      <span className="text-[7px] font-bold text-white">MangoPay</span>
    </div>
  </div>
);

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
  codAvailable,
  codFees,
  productPrice,
  onCardDetailsChange,
}) => {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const calculateCODExtra = () => {
    if (!codFees) return 0;
    return (productPrice * codFees.percentage) / 100 + codFees.fixed + codFees.transport;
  };

  const codExtra = calculateCODExtra();

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
    }
    return numbers;
  };

  const handleCardChange = (field: keyof CardDetails, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    const newDetails = { ...cardDetails, [field]: formattedValue };
    setCardDetails(newDetails);
    onCardDetailsChange?.(newDetails);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Metodă de Plată
      </h4>

      <RadioGroup value={selected} onValueChange={(v) => onSelect(v as PaymentMethod)} className="space-y-3">
        {/* Card Payment via MangoPay */}
        <div
          className={cn(
            "rounded-xl border-2 transition-all overflow-hidden",
            selected === 'card'
              ? 'border-primary bg-primary/5 shadow-lg'
              : 'border-border hover:border-primary/50'
          )}
        >
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => onSelect('card')}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="card" id="card" />
              <div>
                <Label htmlFor="card" className="cursor-pointer font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Plată cu Cardul
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Securizat
                  </Badge>
                </Label>
                <div className="mt-2">
                  <CardBrands />
                </div>
              </div>
            </div>
            <span className="font-medium text-green-600 text-sm">Recomandat</span>
          </div>

          {/* Card Input Form */}
          {selected === 'card' && (
            <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4 bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-sm">Numărul Cardului</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                  className="font-mono text-lg tracking-wider"
                  maxLength={19}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardholderName" className="text-sm">Numele de pe Card</Label>
                <Input
                  id="cardholderName"
                  placeholder="ION POPESCU"
                  value={cardDetails.cardholderName}
                  onChange={(e) => handleCardChange('cardholderName', e.target.value.toUpperCase())}
                  className="uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-sm">Data Expirării</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={(e) => handleCardChange('expiryDate', e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-sm">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardChange('cvv', e.target.value)}
                    type="password"
                    maxLength={4}
                  />
                </div>
              </div>

              <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/30">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                  Plățile sunt procesate securizat prin MangoPay. Nu stocăm informațiile cardului tău.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* COD Payment */}
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
            !codAvailable
              ? 'border-border bg-muted/30 cursor-not-allowed opacity-60'
              : selected === 'cod'
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 cursor-pointer shadow-lg'
              : 'border-border hover:border-amber-500/50 cursor-pointer'
          )}
          onClick={() => codAvailable && onSelect('cod')}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="cod" id="cod" disabled={!codAvailable} />
            <div>
              <Label 
                htmlFor="cod" 
                className={`font-medium flex items-center gap-2 ${!codAvailable ? '' : 'cursor-pointer'}`}
              >
                <Banknote className="h-4 w-4" />
                Plată la Livrare (Ramburs)
                {codAvailable && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                    +{codExtra.toFixed(2)} RON
                  </Badge>
                )}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {codAvailable
                  ? 'Plătești în numerar curierului la primirea coletului'
                  : 'Vânzătorul nu acceptă plată la livrare pentru acest produs'}
              </p>
            </div>
          </div>
          {!codAvailable && (
            <Badge variant="secondary" className="text-xs">Indisponibil</Badge>
          )}
        </div>
      </RadioGroup>

      {selected === 'cod' && codAvailable && (
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Taxe Ramburs:</strong> Comision curier {codFees?.percentage}% + {codFees?.fixed} RON + 
            transport {codFees?.transport} RON. Pregătește suma exactă pentru curier.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};