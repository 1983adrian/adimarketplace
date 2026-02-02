import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import roTranslations from './locales/ro.json';
import enTranslations from './locales/en.json';
import deTranslations from './locales/de.json';
import esTranslations from './locales/es.json';
import zhTranslations from './locales/zh.json';
import frTranslations from './locales/fr.json';
import itTranslations from './locales/it.json';
import ptTranslations from './locales/pt.json';
import ruTranslations from './locales/ru.json';
import jaTranslations from './locales/ja.json';
import arTranslations from './locales/ar.json';
import plTranslations from './locales/pl.json';
import nlTranslations from './locales/nl.json';
import trTranslations from './locales/tr.json';
import koTranslations from './locales/ko.json';
import hiTranslations from './locales/hi.json';

export type SupportedLanguage = 'ro' | 'en' | 'de' | 'es' | 'zh' | 'fr' | 'it' | 'pt' | 'ru' | 'ja' | 'ar' | 'pl' | 'nl' | 'tr' | 'ko' | 'hi';

export const LANGUAGE_CONFIG: Record<SupportedLanguage, { name: string; flag: string }> = {
  ro: { name: 'Română', flag: 'RO' },
  en: { name: 'English', flag: 'US' },
  de: { name: 'Deutsch', flag: 'DE' },
  es: { name: 'Español', flag: 'ES' },
  fr: { name: 'Français', flag: 'FR' },
  it: { name: 'Italiano', flag: 'IT' },
  zh: { name: '中文', flag: 'CN' },
  pt: { name: 'Português', flag: 'PT' },
  ru: { name: 'Русский', flag: 'RU' },
  ja: { name: '日本語', flag: 'JP' },
  ar: { name: 'العربية', flag: 'SA' },
  pl: { name: 'Polski', flag: 'PL' },
  nl: { name: 'Nederlands', flag: 'NL' },
  tr: { name: 'Türkçe', flag: 'TR' },
  ko: { name: '한국어', flag: 'KR' },
  hi: { name: 'हिन्दी', flag: 'IN' }
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
      ro: { translation: roTranslations },
      en: { translation: enTranslations },
      de: { translation: deTranslations },
      es: { translation: esTranslations },
      zh: { translation: zhTranslations },
      fr: { translation: frTranslations },
      it: { translation: itTranslations },
      pt: { translation: ptTranslations },
      ru: { translation: ruTranslations },
      ja: { translation: jaTranslations },
      ar: { translation: arTranslations },
      pl: { translation: plTranslations },
      nl: { translation: nlTranslations },
      tr: { translation: trTranslations },
      ko: { translation: koTranslations },
      hi: { translation: hiTranslations }
    },
    fallbackLng: 'ro',
    interpolation: { escapeValue: false }
  });

export default i18n;
EOFcat << 'EOF' > public/sitemap.xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.marketplaceromania.com/</loc>
    <xhtml:link rel="alternate" hreflang="ro" href="https://www.marketplaceromania.com/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.marketplaceromania.com/en/"/>
    <xhtml:link rel="alternate" hreflang="de" href="https://www.marketplaceromania.com/de/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://www.marketplaceromania.com/fr/"/>
    <xhtml:link rel="alternate" hreflang="it" href="https://www.marketplaceromania.com/it/"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://www.marketplaceromania.com/es/"/>
    <xhtml:link rel="alternate" hreflang="pt" href="https://www.marketplaceromania.com/pt/"/>
  </url>
</urlset>
