// Simple language configuration for geo-based auto-translation
// Country detection happens in LocationContext

export type SupportedLanguage = 'ro' | 'en' | 'de' | 'es' | 'zh' | 'fr' | 'it' | 'pt' | 'nl' | 'pl' | 'sv' | 'da' | 'no' | 'fi' | 'cs' | 'hu' | 'bg' | 'hr' | 'el' | 'tr' | 'uk';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['ro', 'en', 'de', 'es', 'zh', 'fr', 'it', 'pt', 'nl', 'pl', 'sv', 'da', 'no', 'fi', 'cs', 'hu', 'bg', 'hr', 'el', 'tr', 'uk'];

export const LANGUAGE_CONFIG: Record<SupportedLanguage, {
  name: string;
  nativeName: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  locale: string;
}> = {
  ro: { name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', currency: 'RON', currencySymbol: 'lei', locale: 'ro-RO' },
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', locale: 'en-GB' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€', locale: 'de-DE' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', locale: 'es-ES' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳', currency: 'CNY', currencySymbol: '¥', locale: 'zh-CN' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', locale: 'fr-FR' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€', locale: 'it-IT' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', currency: 'EUR', currencySymbol: '€', locale: 'pt-PT' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€', locale: 'nl-NL' },
  pl: { name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', currency: 'PLN', currencySymbol: 'zł', locale: 'pl-PL' },
  sv: { name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr', locale: 'sv-SE' },
  da: { name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', currency: 'DKK', currencySymbol: 'kr', locale: 'da-DK' },
  no: { name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', currency: 'NOK', currencySymbol: 'kr', locale: 'nb-NO' },
  fi: { name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', currency: 'EUR', currencySymbol: '€', locale: 'fi-FI' },
  cs: { name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', currency: 'CZK', currencySymbol: 'Kč', locale: 'cs-CZ' },
  hu: { name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', currency: 'HUF', currencySymbol: 'Ft', locale: 'hu-HU' },
  bg: { name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', currency: 'BGN', currencySymbol: 'лв', locale: 'bg-BG' },
  hr: { name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', currency: 'EUR', currencySymbol: '€', locale: 'hr-HR' },
  el: { name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', currency: 'EUR', currencySymbol: '€', locale: 'el-GR' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', currency: 'TRY', currencySymbol: '₺', locale: 'tr-TR' },
  uk: { name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', currency: 'UAH', currencySymbol: '₴', locale: 'uk-UA' },
};

// Country to language mapping - ALL European countries
export const COUNTRY_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  // Romanian speaking
  RO: 'ro', MD: 'ro',
  // English speaking
  GB: 'en', US: 'en', AU: 'en', CA: 'en', IE: 'en', NZ: 'en', MT: 'en',
  // German speaking
  DE: 'de', AT: 'de', CH: 'de', LI: 'de', LU: 'de',
  // Spanish speaking
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es',
  // Chinese speaking
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  // French speaking
  FR: 'fr', BE: 'fr', MC: 'fr',
  // Italian speaking
  IT: 'it', SM: 'it', VA: 'it',
  // Portuguese speaking
  PT: 'pt', BR: 'pt',
  // Dutch speaking
  NL: 'nl',
  // Polish speaking
  PL: 'pl',
  // Swedish speaking
  SE: 'sv',
  // Danish speaking
  DK: 'da',
  // Norwegian speaking
  NO: 'no',
  // Finnish speaking
  FI: 'fi',
  // Czech speaking
  CZ: 'cs',
  // Hungarian speaking
  HU: 'hu',
  // Bulgarian speaking
  BG: 'bg',
  // Croatian speaking
  HR: 'hr',
  // Greek speaking
  GR: 'el', CY: 'el',
  // Turkish speaking
  TR: 'tr',
  // Ukrainian speaking
  UA: 'uk',
  // Baltic & Balkan - fallback to English (closest supported)
  SK: 'cs', // Slovak -> Czech (very similar)
  SI: 'hr', // Slovenian -> Croatian (similar)
  RS: 'hr', // Serbian -> Croatian (similar)
  BA: 'hr', // Bosnian -> Croatian (similar)
  ME: 'hr', // Montenegrin -> Croatian (similar)
  MK: 'bg', // Macedonian -> Bulgarian (similar)
  AL: 'en', // Albanian -> English
  LT: 'en', // Lithuanian -> English
  LV: 'en', // Latvian -> English
  EE: 'en', // Estonian -> English
  IS: 'en', // Icelandic -> English
};

// Exchange rates from RON (base currency) - approximate
export const EXCHANGE_RATES: Record<string, number> = {
  RON: 1,
  EUR: 0.20,
  USD: 0.22,
  CNY: 1.56,
  GBP: 0.17,
  PLN: 0.86,
  SEK: 2.18,
  DKK: 1.49,
  NOK: 2.26,
  CZK: 4.96,
  HUF: 77.50,
  BGN: 0.39,
  TRY: 7.20,
  UAH: 8.80,
  CHF: 0.19,
};

// Get language from country code
export function getLanguageFromCountry(countryCode: string): SupportedLanguage {
  return COUNTRY_TO_LANGUAGE[countryCode] || 'en'; // Default to English for international
}
