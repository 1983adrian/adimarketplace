import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getLanguageFromPath, LANGUAGE_CONFIG, EXCHANGE_RATES, type SupportedLanguage } from '@/i18n/config';

export type Currency = 'GBP' | 'EUR' | 'USD' | 'RON' | 'CNY';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}

const CURRENCIES: Record<Currency, CurrencyInfo> = {
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  RON: { code: 'RON', symbol: 'lei', name: 'Romanian Leu', locale: 'ro-RO' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
};

interface CurrencyContextType {
  currency: Currency;
  currencyInfo: CurrencyInfo;
  formatPrice: (price: number, fromCurrency?: Currency) => string;
  formatPriceWithRON: (priceInRON: number) => string;
  convertPrice: (price: number, fromCurrency: Currency, toCurrency?: Currency) => number;
  availableCurrencies: CurrencyInfo[];
  detectedCountry: string | null;
  isDetecting: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Get currency from URL language
  const currentLanguage = getLanguageFromPath(location.pathname);
  const languageConfig = LANGUAGE_CONFIG[currentLanguage];
  const currency = languageConfig.currency as Currency;

  // Convert price from one currency to visitor's currency
  const convertPrice = useCallback((price: number, fromCurrency: Currency, toCurrency?: Currency): number => {
    const targetCurrency = toCurrency || currency;
    
    if (fromCurrency === targetCurrency) {
      return price;
    }

    // Convert to RON first (base currency), then to target
    const rateFrom = EXCHANGE_RATES[fromCurrency] || 1;
    const rateTo = EXCHANGE_RATES[targetCurrency] || 1;
    
    // If fromCurrency is RON, just multiply by target rate
    if (fromCurrency === 'RON') {
      return price * rateTo;
    }
    
    // Convert from source to RON, then to target
    const priceInRON = price / rateFrom;
    return priceInRON * rateTo;
  }, [currency]);

  // Format price in visitor's currency
  const formatPrice = useCallback((price: number, fromCurrency: Currency = 'RON'): string => {
    const convertedPrice = convertPrice(price, fromCurrency, currency);
    const currencyInfo = CURRENCIES[currency];
    
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedPrice);
  }, [currency, convertPrice]);

  // Format price showing RON + local currency conversion
  const formatPriceWithRON = useCallback((priceInRON: number): string => {
    const ronFormatted = new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceInRON);

    if (currency === 'RON') {
      return ronFormatted;
    }

    const convertedPrice = convertPrice(priceInRON, 'RON', currency);
    const localFormatted = new Intl.NumberFormat(CURRENCIES[currency].locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedPrice);

    return `${ronFormatted} (≈${localFormatted})`;
  }, [currency, convertPrice]);

  const value: CurrencyContextType = {
    currency,
    currencyInfo: CURRENCIES[currency],
    formatPrice,
    formatPriceWithRON,
    convertPrice,
    availableCurrencies: Object.values(CURRENCIES),
    detectedCountry,
    isDetecting,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export { CURRENCIES, EXCHANGE_RATES };
