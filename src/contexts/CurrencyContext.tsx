import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Currency = 'GBP' | 'EUR' | 'USD' | 'RON';

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
};

// Exchange rates (base: GBP) - in production use an API
const EXCHANGE_RATES: Record<Currency, number> = {
  GBP: 1,
  EUR: 1.17,
  USD: 1.27,
  RON: 5.82,
};

// Country to currency mapping for auto-detection
const COUNTRY_CURRENCY: Record<string, Currency> = {
  // Romania -> RON
  RO: 'RON',
  // UK -> GBP
  GB: 'GBP', UK: 'GBP',
  // Europe -> EUR
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', 
  IE: 'EUR', PT: 'EUR', GR: 'EUR', FI: 'EUR', SK: 'EUR', SI: 'EUR', LV: 'EUR', 
  LT: 'EUR', EE: 'EUR', CY: 'EUR', MT: 'EUR', LU: 'EUR', PL: 'EUR', CZ: 'EUR', 
  HU: 'EUR', BG: 'EUR', SE: 'EUR', DK: 'EUR', NO: 'EUR', CH: 'EUR', HR: 'EUR',
  // US and rest of world -> USD (default)
  US: 'USD',
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
  const [currency, setCurrency] = useState<Currency>('RON');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);

  // Auto-detect currency based on IP geolocation
  useEffect(() => {
    const detectCurrency = async () => {
      setIsDetecting(true);
      
      // Try timezone detection first (instant, no network)
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const countryFromTimezone = getCountryFromTimezone(timezone);
        
        if (countryFromTimezone) {
          setDetectedCountry(countryFromTimezone);
          const detectedCurrency = getCurrencyForCountry(countryFromTimezone);
          setCurrency(detectedCurrency);
          setIsDetecting(false);
          return;
        }
      } catch (e) {
        console.log('Timezone detection failed');
      }

      // Fallback: IP geolocation
      try {
        const response = await fetch('https://ipapi.co/json/', { 
          signal: AbortSignal.timeout(3000) 
        });
        if (response.ok) {
          const data = await response.json();
          if (data.country_code) {
            setDetectedCountry(data.country_code);
            const detectedCurrency = getCurrencyForCountry(data.country_code);
            setCurrency(detectedCurrency);
          }
        }
      } catch (e) {
        console.log('IP geolocation failed, using default RON');
        setCurrency('RON');
      }
      
      setIsDetecting(false);
    };

    detectCurrency();
  }, []);

  // Convert price from one currency to visitor's currency
  const convertPrice = useCallback((price: number, fromCurrency: Currency, toCurrency?: Currency): number => {
    const targetCurrency = toCurrency || currency;
    
    if (fromCurrency === targetCurrency) {
      return price;
    }

    // Convert to GBP first (base currency), then to target
    const priceInGBP = price / EXCHANGE_RATES[fromCurrency];
    const priceInTarget = priceInGBP * EXCHANGE_RATES[targetCurrency];
    
    return priceInTarget;
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

  // Format price showing RON + local currency conversion (for fees, taxes, etc.)
  const formatPriceWithRON = useCallback((priceInRON: number): string => {
    const ronFormatted = new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceInRON);

    // If user currency is already RON, just show RON
    if (currency === 'RON') {
      return ronFormatted;
    }

    // Otherwise show RON + converted amount
    const convertedPrice = convertPrice(priceInRON, 'RON', currency);
    const localFormatted = new Intl.NumberFormat(CURRENCIES[currency].locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedPrice);

    return `${ronFormatted} (~${localFormatted})`;
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

// Get currency based on country code
function getCurrencyForCountry(countryCode: string): Currency {
  // Romania -> RON
  if (countryCode === 'RO') return 'RON';
  
  // UK -> GBP
  if (countryCode === 'GB' || countryCode === 'UK') return 'GBP';
  
  // European countries -> EUR
  const europeanCountries = [
    'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'GR', 'FI', 'SK', 
    'SI', 'LV', 'LT', 'EE', 'CY', 'MT', 'LU', 'PL', 'CZ', 'HU', 'BG', 'SE', 
    'DK', 'NO', 'CH', 'HR', 'MD'
  ];
  if (europeanCountries.includes(countryCode)) return 'EUR';
  
  // Rest of the world -> USD
  return 'USD';
}

// Helper to guess country from timezone
function getCountryFromTimezone(timezone: string): string | null {
  const timezoneCountryMap: Record<string, string> = {
    'Europe/Bucharest': 'RO',
    'Europe/London': 'GB',
    'Europe/Berlin': 'DE',
    'Europe/Paris': 'FR',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Europe/Amsterdam': 'NL',
    'Europe/Brussels': 'BE',
    'Europe/Vienna': 'AT',
    'Europe/Dublin': 'IE',
    'Europe/Lisbon': 'PT',
    'Europe/Athens': 'GR',
    'Europe/Helsinki': 'FI',
    'Europe/Warsaw': 'PL',
    'Europe/Prague': 'CZ',
    'Europe/Budapest': 'HU',
    'Europe/Sofia': 'BG',
    'Europe/Stockholm': 'SE',
    'Europe/Copenhagen': 'DK',
    'Europe/Oslo': 'NO',
    'Europe/Zurich': 'CH',
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
  };
  return timezoneCountryMap[timezone] || null;
}

export { CURRENCIES, EXCHANGE_RATES };
