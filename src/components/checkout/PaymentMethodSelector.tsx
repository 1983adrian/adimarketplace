import React from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export type PaymentMethod = 'card';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  productPrice: number;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
  productPrice,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Metodă de Plată
      </h4>

      {/* PayPal Payment - Single Option */}
      <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div>
            <Label className="font-medium flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5" />
              Plată Securizată prin PayPal
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                PayPal
              </Badge>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Plătești securizat prin PayPal — card bancar sau cont PayPal
            </p>
          </div>
        </div>
      </div>

      <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/30">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
          Vei fi redirecționat către <strong>PayPal</strong> pentru a finaliza plata securizat. Poți plăti cu card bancar, cont PayPal sau PayPal Credit.
        </AlertDescription>
      </Alert>
    </div>
  );
};
