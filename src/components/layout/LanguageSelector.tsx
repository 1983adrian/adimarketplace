import React, { useEffect, useState } from 'react';
import { Globe, Check, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { LANGUAGE_CONFIG, COUNTRY_TO_LANGUAGE, type SupportedLanguage } from '@/i18n/config';

// Google Translate language codes mapping
const GOOGLE_LANG_CODES: Record<SupportedLanguage, string> = {
  ro: 'ro',
  en: 'en',
  de: 'de',
  es: 'es',
  zh: 'zh-CN',
  fr: 'fr',
  it: 'it',
  pt: 'pt',
  nl: 'nl',
  pl: 'pl',
};

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, isAutoDetected } = useLanguage();
  const { location: geoLocation, isLoading: geoLoading } = useLocation();
  const [isTranslating, setIsTranslating] = useState(false);
  
  const currentConfig = LANGUAGE_CONFIG[language];

  // Initialize Google Translate
  useEffect(() => {
    // Add Google Translate script if not already loaded
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
      
      // Initialize callback
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'ro',
          includedLanguages: 'en,de,es,fr,it,pt,nl,pl,zh-CN,zh-TW,ja,ko,ar,ru,tr,hi',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        }, 'google_translate_element');
      };
    }
  }, []);

  // Auto-translate based on detected country
  useEffect(() => {
    if (geoLocation?.countryCode && isAutoDetected) {
      const detectedLang = COUNTRY_TO_LANGUAGE[geoLocation.countryCode];
      if (detectedLang && detectedLang !== 'ro') {
        // Trigger Google Translate after a short delay
        setTimeout(() => {
          triggerGoogleTranslate(GOOGLE_LANG_CODES[detectedLang] || 'en');
        }, 1500);
      }
    }
  }, [geoLocation, isAutoDetected]);

  // Trigger Google Translate programmatically
  const triggerGoogleTranslate = (langCode: string) => {
    setIsTranslating(true);
    
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event('change'));
    }
    
    setTimeout(() => setIsTranslating(false), 2000);
  };

  // Change language manually
  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    
    if (lang === 'ro') {
      // Reset to original Romanian by clearing the cookie
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      window.location.reload();
    } else {
      triggerGoogleTranslate(GOOGLE_LANG_CODES[lang] || 'en');
    }
  };

  // Main languages to show in selector
  const mainLanguages: SupportedLanguage[] = ['ro', 'en', 'de', 'es', 'fr', 'it', 'zh', 'pl'];

  return (
    <>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" className="hidden" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border-2 border-blue-500/30 transition-all duration-200 hover:scale-105"
            title="Select Language / Selectează Limba"
          >
            {isTranslating || geoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-lg">{currentConfig.flag}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 shadow-xl">
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Language / Limbă</span>
            </div>
            {geoLocation && (
              <p className="text-xs text-muted-foreground mt-1">
                📍 Detectat: {geoLocation.countryName}
              </p>
            )}
          </div>
          
          {mainLanguages.map((langCode) => {
            const config = LANGUAGE_CONFIG[langCode];
            const isActive = language === langCode;
            
            return (
              <DropdownMenuItem
                key={langCode}
                onClick={() => handleLanguageChange(langCode)}
                className={`cursor-pointer flex items-center gap-3 py-2.5 px-3 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'hover:bg-muted'
                }`}
              >
                <span className="text-xl">{config.flag}</span>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium">{config.nativeName}</span>
                  <span className="text-xs text-muted-foreground">
                    {config.name} • {config.currency}
                  </span>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 text-primary" />
                )}
                {isActive && isAutoDetected && (
                  <span className="text-[10px] bg-green-500/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                    AUTO
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <div className="px-3 py-2 text-xs text-muted-foreground">
            🌐 Traducere automată cu Google
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default LanguageSelector;
