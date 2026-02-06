import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_CONFIG, type SupportedLanguage } from '@/i18n/config';

export const useLocalizedNavigation = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const languageConfig = LANGUAGE_CONFIG[language];
  
  // Navigate to a path (no more language prefixes needed)
  const navigateTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);
  
  // Change language (stores in localStorage, triggers re-render)
  const changeLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguage(newLang);
    // No navigation needed - the language context handles everything
  }, [setLanguage]);
  
  // Get href for links (no prefix needed anymore)
  const getLocalizedHref = useCallback((path: string) => {
    return path;
  }, []);
  
  return {
    navigateTo,
    changeLanguage,
    getLocalizedHref,
    currentLanguage: language,
    languageConfig,
    currentCurrency: languageConfig?.currency || 'RON'
  };
};

export default useLocalizedNavigation;
