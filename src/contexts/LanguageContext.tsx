import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { LANGUAGE_CONFIG, COUNTRY_TO_LANGUAGE, type SupportedLanguage } from '@/i18n/config';
import { translations, getTranslation } from '@/i18n/translations';
import { useLocation } from '@/contexts/LocationContext';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  detectedFromLocation: boolean;
  isAutoDetected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { location: geoLocation, isLoading: geoLoading } = useLocation();
  const [language, setLanguageState] = useState<SupportedLanguage>('ro');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  
  // Auto-detect language based on country
  useEffect(() => {
    // Check localStorage first for manual preference
    const savedLang = localStorage.getItem('user_language') as SupportedLanguage;
    if (savedLang && LANGUAGE_CONFIG[savedLang]) {
      setLanguageState(savedLang);
      return;
    }
    
    // Auto-detect from geolocation
    if (geoLocation?.countryCode) {
      const detectedLang = COUNTRY_TO_LANGUAGE[geoLocation.countryCode] || 'en';
      setLanguageState(detectedLang);
      setIsAutoDetected(true);
      console.log(`Auto-detected language: ${detectedLang} for country: ${geoLocation.countryCode}`);
    }
  }, [geoLocation]);
  
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    setIsAutoDetected(false);
    localStorage.setItem('user_language', lang);
    console.log(`Language manually set to: ${lang}`);
  };
  
  // Translation function that uses our static translations
  const t = (key: string): string => {
    const keys = key.split('.') as (keyof typeof translations['en'])[];
    const fullKey = key as keyof typeof translations['en'];
    
    // Try to get translation from current language
    if (translations[language] && (translations[language] as any)[fullKey]) {
      return (translations[language] as any)[fullKey];
    }
    
    // Fallback to English
    if (translations.en && (translations.en as any)[fullKey]) {
      return (translations.en as any)[fullKey];
    }
    
    // Return key if no translation found
    return key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    detectedFromLocation: isAutoDetected,
    isAutoDetected
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Re-export type for backwards compatibility
export type Language = SupportedLanguage;
