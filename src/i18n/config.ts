import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export type SupportedLanguage = 'ro' | 'en' | 'de' | 'es' | 'zh' | 'fr' | 'it' | 'pt' | 'ru' | 'ja' | 'ar' | 'pl' | 'nl' | 'tr' | 'ko' | 'hi';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ro',
    supportedLngs: ['ro', 'en', 'de', 'es', 'zh', 'fr', 'it', 'pt', 'ru', 'ja', 'ar', 'pl', 'nl', 'tr', 'ko', 'hi'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['path', 'cookie', 'htmlTag', 'localStorage', 'subdomain'],
      caches: ['cookie'],
    },
  });

export default i18n;
