import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import roTranslations from './locales/ro.json';
import enTranslations from './locales/en.json';
import deTranslations from './locales/de.json';
import esTranslations from './locales/es.json';
import zhTranslations from './locales/zh.json';

export type SupportedLanguage = 'ro' | 'en' | 'de' | 'es' | 'zh';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['ro', 'en', 'de', 'es', 'zh'];

export const LANGUAGE_CONFIG: Record<SupportedLanguage, {
  name: string;
  nativeName: string;
  flag: string;
  currency: 'RON' | 'EUR' | 'USD' | 'CNY';
  currencySymbol: string;
  locale: string;
  hreflangCode: string;
}> = {
  ro: {
    name: 'Romanian',
    nativeName: 'Română',
    flag: '🇷🇴',
    currency: 'RON',
    currencySymbol: 'lei',
    locale: 'ro-RO',
    hreflangCode: 'ro'
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'en-GB',
    hreflangCode: 'en'
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
    hreflangCode: 'de'
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'es-ES',
    hreflangCode: 'es'
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    currency: 'CNY',
    currencySymbol: '¥',
    locale: 'zh-CN',
    hreflangCode: 'zh'
  }
};

// Exchange rates from RON (base currency)
export const EXCHANGE_RATES: Record<string, number> = {
  RON: 1,
  EUR: 0.20,    // 1 RON = 0.20 EUR
  USD: 0.22,    // 1 RON = 0.22 USD
  CNY: 1.56,    // 1 RON = 1.56 CNY
  GBP: 0.17,    // 1 RON = 0.17 GBP
};

// Get language from URL path
export function getLanguageFromPath(pathname: string): SupportedLanguage {
  const langMatch = pathname.match(/^\/(en|de|es|zh)(\/|$)/);
  if (langMatch) {
    return langMatch[1] as SupportedLanguage;
  }
  return 'ro'; // Default to Romanian
}

// Get path without language prefix
export function getPathWithoutLanguage(pathname: string): string {
  return pathname.replace(/^\/(en|de|es|zh)(\/|$)/, '/').replace(/\/+/g, '/') || '/';
}

// Get localized path
export function getLocalizedPath(pathname: string, lang: SupportedLanguage): string {
  const cleanPath = getPathWithoutLanguage(pathname);
  if (lang === 'ro') {
    return cleanPath;
  }
  return `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
}

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: roTranslations },
      en: { translation: enTranslations },
      de: { translation: deTranslations },
      es: { translation: esTranslations },
      zh: { translation: zhTranslations }
    },
    fallbackLng: 'ro',
    supportedLngs: SUPPORTED_LANGUAGES,
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

export default i18n;
