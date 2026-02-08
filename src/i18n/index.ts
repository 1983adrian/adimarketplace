import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ro from './locales/ro.json';

export * from './config';

// Initialize i18next with Romanian as the base language
// Google Translate widget handles translation to other languages
i18n
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: ro },
    },
    lng: 'ro', // Always use Romanian as source for Google Translate
    fallbackLng: 'ro',
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    // Return the key itself if translation not found (for debugging)
    returnNull: false,
    returnEmptyString: false,
    // Use nested keys with dot separator
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;
