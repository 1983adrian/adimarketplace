import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export type SupportedLanguage = 'ro' | 'en' | 'de' | 'es' | 'zh' | 'fr' | 'it' | 'pt';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['ro', 'en', 'de', 'es', 'zh', 'fr', 'it', 'pt'];

export const LANGUAGE_CONFIG: Record<SupportedLanguage, { name: string; locale: string }> = {
  ro: { name: 'Română', locale: 'ro-RO' },
  en: { name: 'English', locale: 'en-US' },
  de: { name: 'Deutsch', locale: 'de-DE' },
  es: { name: 'Español', locale: 'es-ES' },
  zh: { name: '中文', locale: 'zh-CN' },
  fr: { name: 'Français', locale: 'fr-FR' },
  it: { name: 'Italiano', locale: 'it-IT' },
  pt: { name: 'Português', locale: 'pt-PT' },
};

export const getPathWithoutLanguage = (pathname: string) => {
  const parts = pathname.split('/');
  if (SUPPORTED_LANGUAGES.includes(parts[1] as SupportedLanguage)) {
    return '/' + parts.slice(2).join('/');
  }
  return pathname;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: {} },
      en: { translation: {} },
    },
    fallbackLng: 'ro',
    interpolation: { escapeValue: false },
  });

export default i18n;
