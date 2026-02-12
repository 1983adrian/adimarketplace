import React from 'react';
import { CreditCard, Banknote, Info, AlertTriangle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'card' | 'cod';

// CardDetails kept for type compatibility but card payment is disabled
export interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

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

  // Auto-select COD if card is selected (card is disabled)
  React.useEffect(() => {
    if (selected === 'card' && codAvailable) {
      onSelect('cod');
    }
  }, [selected, codAvailable, onSelect]);

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <Banknote className="h-4 w-4" />
        Metodă de Plată
      </h4>

      <RadioGroup value={selected} onValueChange={(v) => onSelect(v as PaymentMethod)} className="space-y-3">
        {/* Card Payment - DISABLED - no processor integrated */}
        <div
          className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-muted/30 cursor-not-allowed opacity-60"
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="card" id="card" disabled />
            <div>
              <Label htmlFor="card" className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Plată cu Cardul
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Indisponibil
                </Badge>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Plata cu cardul nu este încă disponibilă. Folosește Ramburs (COD).
              </p>
            </div>
          </div>
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
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="text-xs">Indisponibil</Badge>
              <span className="text-[10px] text-muted-foreground">Vânzătorul nu a activat COD</span>
            </div>
          )}
        </div>
      </RadioGroup>

      {/* Warning when NO payment method is available */}
      {!codAvailable && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm text-destructive">
            <strong>Nicio metodă de plată disponibilă.</strong> Vânzătorul nu a activat plata la livrare (Ramburs), iar plata cu cardul nu este încă integrată. 
            Contactează vânzătorul pentru a activa opțiunea COD.
          </AlertDescription>
        </Alert>
      )}

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