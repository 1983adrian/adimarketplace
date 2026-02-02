import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export type SupportedLanguage = 'ro' | 'en' | 'de' | 'es' | 'fr' | 'it';

export const LANGUAGE_CONFIG: Record<SupportedLanguage, { name: string; flag: string }> = {
  ro: { name: 'Română', flag: 'RO' },
  en: { name: 'English', flag: 'US' },
  de: { name: 'Deutsch', flag: 'DE' },
  es: { name: 'Español', flag: 'ES' },
  fr: { name: 'Français', flag: 'FR' },
  it: { name: 'Italiano', flag: 'IT' }
};

export const EXCHANGE_RATES = {
  GBP: 1,
  EUR: 1.17,
  USD: 1.27,
  RON: 5.85,
  CNY: 9.15
};

export const getLanguageFromPath = (pathname: string): SupportedLanguage => {
  const parts = pathname.split('/');
  const lang = parts[1] as SupportedLanguage;
  return LANGUAGE_CONFIG[lang] ? lang : 'ro';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: { "welcome": "Bine ai venit" } },
      en: { translation: { "welcome": "Welcome" } }
    },
    fallbackLng: 'ro',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
