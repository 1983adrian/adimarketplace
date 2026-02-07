import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ro from './locales/ro.json';

export * from './config';

// Initialize i18next with Romanian as the only source language
// Google Translate widget handles all other languages dynamically
i18n
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: ro },
    },
    lng: 'ro', // Always use Romanian as source
    fallbackLng: 'ro',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
