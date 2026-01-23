import React, { useState } from 'react';
import { CreditCard, Banknote, ShieldCheck, AlertTriangle, Info, Wallet } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'card' | 'paypal' | 'cod';

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

// PayPal logo SVG
const PayPalLogo = () => (
  <svg viewBox="0 0 101 32" className="h-6 w-auto">
    <path fill="#003087" d="M12.237 2.8H4.437a1.1 1.1 0 0 0-1.092.94L.042 27.393a.66.66 0 0 0 .65.765h3.74a1.1 1.1 0 0 0 1.092-.94l.88-5.533a1.1 1.1 0 0 1 1.091-.94h2.51c5.239 0 8.264-2.547 9.054-7.591.356-2.207.015-3.94-.995-5.15-1.11-1.336-3.084-2.044-5.827-2.044z"/>
    <path fill="#003087" d="M38.337 10.29h-3.737a.662.662 0 0 0-.652.547L33.7 12.3l-.254-.369c-.785-1.145-2.535-1.528-4.282-1.528-4.01 0-7.432 3.053-8.097 7.332-.347 2.13.145 4.168 1.347 5.589 1.103 1.306 2.677 1.852 4.553 1.852 3.219 0 5.003-2.076 5.003-2.076l-.254 1.006a.66.66 0 0 0 .65.765h3.364a1.1 1.1 0 0 0 1.092-.94l2.02-12.876a.66.66 0 0 0-.505-.765z"/>
    <path fill="#009cde" d="M90.235 10.29h-3.74a1.1 1.1 0 0 0-.908.476l-5.244 7.727-2.223-7.421a1.1 1.1 0 0 0-1.052-.782h-3.674a.66.66 0 0 0-.627.869l4.189 12.298-3.94 5.563a.66.66 0 0 0 .539 1.045h3.737a1.1 1.1 0 0 0 .905-.472l12.644-18.251a.66.66 0 0 0-.606-1.052z"/>
    <path fill="#009cde" d="M60.737 2.8h-7.8a1.1 1.1 0 0 0-1.092.94l-3.303 20.654a.66.66 0 0 0 .65.765h4.02a.77.77 0 0 0 .766-.659l.937-5.814a1.1 1.1 0 0 1 1.091-.94h2.51c5.239 0 8.264-2.547 9.054-7.591.356-2.207.015-3.94-.995-5.15-1.11-1.336-3.084-2.044-5.838-2.044z"/>
    <path fill="#009cde" d="M86.837 10.29h-3.737a.662.662 0 0 0-.652.547l-.248 1.463-.254-.369c-.785-1.145-2.535-1.528-4.282-1.528-4.01 0-7.432 3.053-8.097 7.332-.347 2.13.145 4.168 1.347 5.589 1.103 1.306 2.677 1.852 4.553 1.852 3.219 0 5.003-2.076 5.003-2.076l-.254 1.006a.66.66 0 0 0 .65.765h3.364a1.1 1.1 0 0 0 1.092-.94l2.02-12.876a.66.66 0 0 0-.505-.765z"/>
  </svg>
);

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
    {/* Apple Pay */}
    <div className="w-10 h-6 bg-black rounded flex items-center justify-center">
      <span className="text-[8px] font-medium text-white">Pay</span>
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
        {/* Card Payment */}
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
                  Datele cardului sunt criptate și procesate securizat. Nu stocăm informațiile cardului tău.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* PayPal Payment */}
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
            selected === 'paypal'
              ? 'border-[#003087] bg-[#003087]/5 shadow-lg'
              : 'border-border hover:border-[#003087]/50'
          )}
          onClick={() => onSelect('paypal')}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="paypal" id="paypal" />
            <div>
              <Label htmlFor="paypal" className="cursor-pointer font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Plată cu PayPal
              </Label>
              <div className="mt-2">
                <PayPalLogo />
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">Rapid & Sigur</Badge>
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

      {selected === 'paypal' && (
        <Alert className="border-[#003087]/50 bg-[#003087]/5">
          <Wallet className="h-4 w-4 text-[#003087]" />
          <AlertDescription className="text-sm text-[#003087]">
            Vei fi redirecționat către PayPal pentru a finaliza plata în siguranță.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};