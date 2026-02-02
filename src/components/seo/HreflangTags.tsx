import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, LANGUAGE_CONFIG, getPathWithoutLanguage, type SupportedLanguage } from '@/i18n/config';

const BASE_URL = 'https://www.marketplaceromania.com';

export const HreflangTags: React.FC = () => {
  const location = useLocation();
  const cleanPath = getPathWithoutLanguage(location.pathname);
  
  // Generate hreflang URLs for all supported languages
  const hreflangUrls = SUPPORTED_LANGUAGES.map((lang) => {
    const config = LANGUAGE_CONFIG[lang];
    const langPath = lang === 'ro' ? cleanPath : `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
    return {
      lang: config.hreflangCode,
      url: `${BASE_URL}${langPath}`
    };
  });
  
  // Add x-default for Romanian (primary language)
  const defaultUrl = `${BASE_URL}${cleanPath}`;
  
  return (
    <Helmet>
      {/* Hreflang tags for all supported languages */}
      {hreflangUrls.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* x-default points to Romanian version */}
      <link rel="alternate" hrefLang="x-default" href={defaultUrl} />
    </Helmet>
  );
};

export default HreflangTags;
