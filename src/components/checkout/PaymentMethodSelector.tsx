import React from 'react';
import { CreditCard, Banknote, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
  codAvailable,
  codFees,
  productPrice,
}) => {
  const calculateCODExtra = () => {
    if (!codFees) return 0;
    return (productPrice * codFees.percentage) / 100 + codFees.fixed + codFees.transport;
  };

  const codExtra = calculateCODExtra();

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Metodă de Plată
      </h4>

      <RadioGroup value={selected} onValueChange={(v) => onSelect(v as PaymentMethod)} className="space-y-3">
        {/* Card Payment */}
        <div
          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selected === 'card'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
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
              <p className="text-sm text-muted-foreground mt-1">
                Visa, Mastercard, Apple Pay, Google Pay
              </p>
            </div>
          </div>
          <span className="font-medium text-green-600">Recomandat</span>
        </div>

        {/* COD Payment */}
        <div
          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
            !codAvailable
              ? 'border-border bg-muted/30 cursor-not-allowed opacity-60'
              : selected === 'cod'
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 cursor-pointer'
              : 'border-border hover:border-amber-500/50 cursor-pointer'
          }`}
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

      {selected === 'card' && (
        <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/30">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800 dark:text-green-200">
            Plata cu cardul este procesată securizat. Banii sunt protejați până la confirmarea livrării.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
