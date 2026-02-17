import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, LANGUAGE_CONFIG, type SupportedLanguage } from '@/i18n/config';

const BASE_URL = 'https://www.marketplaceromania.com';

export const HreflangTags: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Generate hreflang URLs for all supported languages + European country variants
  const allHreflangCodes = [
    'ro', 'en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'zh',
    // European country-specific variants for broader reach
    'en-GB', 'en-IE', 'de-AT', 'de-CH', 'fr-BE', 'nl-BE', 'pt-PT',
    'sv', 'da', 'fi', 'no', 'el', 'cs', 'hu', 'bg', 'hr', 'sk', 'sl',
    'lt', 'lv', 'et', 'mt', 'cy'
  ];
  
  const hreflangUrls = allHreflangCodes.map((lang) => ({
    lang,
    url: `${BASE_URL}${currentPath}`
  }));
  
  // Default URL
  const defaultUrl = `${BASE_URL}${currentPath}`;
  
  return (
    <Helmet>
      {/* Single canonical URL since we use geo-detection, not URL prefixes */}
      <link rel="canonical" href={defaultUrl} />
      
      {/* Hreflang for search engines - all point to same URL since translation is dynamic */}
      {hreflangUrls.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* x-default points to main version */}
      <link rel="alternate" hrefLang="x-default" href={defaultUrl} />
    </Helmet>
  );
};

export default HreflangTags;
