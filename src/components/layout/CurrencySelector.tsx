import React from 'react';
import { useCurrency, CURRENCIES, Currency } from '@/contexts/CurrencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
      <SelectTrigger className="w-[100px] h-8 text-xs">
        <SelectValue>
          {CURRENCIES[currency].symbol} {currency}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableCurrencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code} className="text-sm">
            <span className="flex items-center gap-2">
              <span className="font-medium">{curr.symbol}</span>
              <span>{curr.code}</span>
              <span className="text-muted-foreground text-xs">- {curr.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
