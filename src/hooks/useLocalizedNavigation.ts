import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  getLanguageFromPath, 
  getLocalizedPath, 
  LANGUAGE_CONFIG, 
  type SupportedLanguage 
} from '@/i18n/config';

export const useLocalizedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  
  const currentLanguage = getLanguageFromPath(location.pathname) as SupportedLanguage;
  const languageConfig = LANGUAGE_CONFIG[currentLanguage];
  
  // Navigate to a path while preserving language prefix
  const navigateTo = useCallback((path: string) => {
    const localizedPath = getLocalizedPath(path, currentLanguage);
    navigate(localizedPath);
  }, [navigate, currentLanguage]);
  
  // Change language and navigate to the same page in new language
  const changeLanguage = useCallback((newLang: SupportedLanguage) => {
    const newPath = getLocalizedPath(location.pathname, newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
    navigate(newPath);
  }, [navigate, location.pathname, i18n]);
  
  // Get localized href for links
  const getLocalizedHref = useCallback((path: string) => {
    return getLocalizedPath(path, currentLanguage);
  }, [currentLanguage]);
  
  return {
    navigateTo,
    changeLanguage,
    getLocalizedHref,
    currentLanguage,
    languageConfig,
    currentCurrency: languageConfig.currency
  };
};

export default useLocalizedNavigation;
