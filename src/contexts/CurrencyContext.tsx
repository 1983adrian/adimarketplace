import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Currency = 'GBP' | 'EUR' | 'USD' | 'RON' | 'PLN' | 'CZK' | 'HUF' | 'BGN' | 'SEK' | 'DKK' | 'NOK' | 'CHF';

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
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU' },
  BGN: { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', locale: 'bg-BG' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
};

// Country to currency mapping
const COUNTRY_CURRENCY: Record<string, Currency> = {
  GB: 'GBP', UK: 'GBP',
  US: 'USD',
  RO: 'RON',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', GR: 'EUR', FI: 'EUR', SK: 'EUR', SI: 'EUR', LV: 'EUR', LT: 'EUR', EE: 'EUR', CY: 'EUR', MT: 'EUR', LU: 'EUR',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  BG: 'BGN',
  SE: 'SEK',
  DK: 'DKK',
  NO: 'NOK',
  CH: 'CHF',
};

// Static exchange rates (base: GBP) - in production use an API
const EXCHANGE_RATES: Record<Currency, number> = {
  GBP: 1,
  EUR: 1.17,
  USD: 1.27,
  RON: 5.82,
  PLN: 5.06,
  CZK: 29.5,
  HUF: 460,
  BGN: 2.29,
  SEK: 13.5,
  DKK: 8.72,
  NOK: 13.8,
  CHF: 1.12,
};

interface CurrencyContextType {
  currency: Currency;
  currencyInfo: CurrencyInfo;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInGBP: number, showOriginal?: boolean) => string;
  convertPrice: (priceInGBP: number) => number;
  availableCurrencies: CurrencyInfo[];
  baseCurrency: Currency;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('GBP');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  // Detect user's country on mount
  useEffect(() => {
    const detectLocation = async () => {
      // Check saved preference first
      const saved = localStorage.getItem('currency') as Currency;
      if (saved && CURRENCIES[saved]) {
        setCurrencyState(saved);
        return;
      }

      // Try to detect from timezone
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const countryFromTimezone = getCountryFromTimezone(timezone);
        if (countryFromTimezone) {
          setDetectedCountry(countryFromTimezone);
          const currencyForCountry = COUNTRY_CURRENCY[countryFromTimezone] || 'GBP';
          setCurrencyState(currencyForCountry);
          return;
        }
      } catch (e) {
        console.log('Could not detect timezone');
      }

      // Fallback: try IP geolocation (free API)
      try {
        const response = await fetch('https://ipapi.co/json/', { 
          signal: AbortSignal.timeout(3000) 
        });
        if (response.ok) {
          const data = await response.json();
          if (data.country_code) {
            setDetectedCountry(data.country_code);
            const currencyForCountry = COUNTRY_CURRENCY[data.country_code] || 'GBP';
            setCurrencyState(currencyForCountry);
          }
        }
      } catch (e) {
        console.log('Could not detect location from IP');
      }
    };

    detectLocation();
  }, []);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  }, []);

  const convertPrice = useCallback((priceInGBP: number): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return priceInGBP * rate;
  }, [currency]);

  const formatPrice = useCallback((priceInGBP: number, showOriginal = false): string => {
    const convertedPrice = convertPrice(priceInGBP);
    const currencyInfo = CURRENCIES[currency];
    
    const formatted = new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'HUF' ? 0 : 2,
      maximumFractionDigits: currency === 'HUF' ? 0 : 2,
    }).format(convertedPrice);

    if (showOriginal && currency !== 'GBP') {
      const originalFormatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
      }).format(priceInGBP);
      return `${formatted} (${originalFormatted})`;
    }

    return formatted;
  }, [currency, convertPrice]);

  const value: CurrencyContextType = {
    currency,
    currencyInfo: CURRENCIES[currency],
    setCurrency,
    formatPrice,
    convertPrice,
    availableCurrencies: Object.values(CURRENCIES),
    baseCurrency: 'GBP',
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

// Helper to guess country from timezone
function getCountryFromTimezone(timezone: string): string | null {
  const timezoneCountryMap: Record<string, string> = {
    'Europe/London': 'GB',
    'Europe/Bucharest': 'RO',
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
  };
  return timezoneCountryMap[timezone] || null;
}

export { CURRENCIES, EXCHANGE_RATES };
