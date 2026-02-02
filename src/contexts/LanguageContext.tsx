import React, { createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getLanguageFromPath, LANGUAGE_CONFIG, type SupportedLanguage } from '@/i18n/config';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  detectedFromLocation: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { t: i18nT, i18n } = useTranslation();
  
  // Get language from URL path
  const language = getLanguageFromPath(location.pathname);
  
  // Sync i18next with current route language
  React.useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);
  
  const setLanguage = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };
  
  // Translation function that supports dot notation
  const t = (key: string): string => {
    return i18nT(key) || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    detectedFromLocation: true
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
