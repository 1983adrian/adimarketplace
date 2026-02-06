// Simple language configuration for geo-based auto-translation
// Country detection happens in LocationContext

export type SupportedLanguage = 'ro' | 'en' | 'de' | 'es' | 'zh' | 'fr' | 'it' | 'pt' | 'nl' | 'pl';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['ro', 'en', 'de', 'es', 'zh', 'fr', 'it', 'pt', 'nl', 'pl'];

export const LANGUAGE_CONFIG: Record<SupportedLanguage, {
  name: string;
  nativeName: string;
  flag: string;
  currency: 'RON' | 'EUR' | 'USD' | 'CNY' | 'GBP' | 'PLN';
  currencySymbol: string;
  locale: string;
}> = {
  ro: {
    name: 'Romanian',
    nativeName: 'Română',
    flag: '🇷🇴',
    currency: 'RON',
    currencySymbol: 'lei',
    locale: 'ro-RO',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'es-ES',
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    currency: 'CNY',
    currencySymbol: '¥',
    locale: 'zh-CN',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'fr-FR',
  },
  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'it-IT',
  },
  pt: {
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'pt-PT',
  },
  nl: {
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'nl-NL',
  },
  pl: {
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    currency: 'PLN',
    currencySymbol: 'zł',
    locale: 'pl-PL',
  }
};

// Country to language mapping
export const COUNTRY_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  // Romanian speaking
  RO: 'ro',
  MD: 'ro',
  // English speaking
  GB: 'en',
  US: 'en',
  AU: 'en',
  CA: 'en',
  IE: 'en',
  NZ: 'en',
  // German speaking
  DE: 'de',
  AT: 'de',
  CH: 'de',
  // Spanish speaking
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  // Chinese speaking
  CN: 'zh',
  TW: 'zh',
  HK: 'zh',
  SG: 'zh',
  // French speaking
  FR: 'fr',
  BE: 'fr',
  // Italian speaking
  IT: 'it',
  // Portuguese speaking
  PT: 'pt',
  BR: 'pt',
  // Dutch speaking
  NL: 'nl',
  // Polish speaking
  PL: 'pl',
};

// Exchange rates from RON (base currency)
export const EXCHANGE_RATES: Record<string, number> = {
  RON: 1,
  EUR: 0.20,
  USD: 0.22,
  CNY: 1.56,
  GBP: 0.17,
  PLN: 0.86,
};

// Get language from country code
export function getLanguageFromCountry(countryCode: string): SupportedLanguage {
  return COUNTRY_TO_LANGUAGE[countryCode] || 'en'; // Default to English for international
}
