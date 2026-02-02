import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  getLanguageFromPath, 
  LANGUAGE_CONFIG, 
  EXCHANGE_RATES,
  type SupportedLanguage 
} from '@/i18n/config';

export const useLocalizedCurrency = () => {
  const location = useLocation();
  const currentLanguage = getLanguageFromPath(location.pathname) as SupportedLanguage;
  const config = LANGUAGE_CONFIG[currentLanguage];
  
  const currency = config.currency;
  const currencySymbol = config.currencySymbol;
  const locale = config.locale;
  
  // Convert price from RON to target currency
  const convertFromRON = useCallback((priceInRON: number, targetCurrency?: string): number => {
    const target = targetCurrency || currency;
    const rate = EXCHANGE_RATES[target] || 1;
    return priceInRON * rate;
  }, [currency]);
  
  // Format price in current locale currency
  const formatPrice = useCallback((priceInRON: number): string => {
    const convertedPrice = convertFromRON(priceInRON);
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedPrice);
  }, [convertFromRON, locale, currency]);
  
  // Format price showing both RON and converted amount
  const formatPriceWithRON = useCallback((priceInRON: number): string => {
    const ronFormatted = new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceInRON);
    
    // If already in RON, just show RON
    if (currency === 'RON') {
      return ronFormatted;
    }
    
    // Show RON + converted
    const convertedFormatted = formatPrice(priceInRON);
    return `${ronFormatted} (≈${convertedFormatted})`;
  }, [currency, formatPrice]);
  
  return {
    currency,
    currencySymbol,
    locale,
    currentLanguage,
    convertFromRON,
    formatPrice,
    formatPriceWithRON
  };
};

export default useLocalizedCurrency;
