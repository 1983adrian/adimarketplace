import React from 'react';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';
import { SUPPORTED_LANGUAGES, LANGUAGE_CONFIG, type SupportedLanguage } from '@/i18n/config';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLocalizedNavigation();
  
  const currentConfig = LANGUAGE_CONFIG[currentLanguage];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border-2 border-blue-500/30 transition-all duration-200 hover:scale-105"
          title="Select Language"
        >
          <span className="text-lg">{currentConfig.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 shadow-xl">
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Language / Limbă</span>
          </div>
        </div>
        {SUPPORTED_LANGUAGES.map((langCode) => {
          const config = LANGUAGE_CONFIG[langCode];
          const isActive = currentLanguage === langCode;
          
          return (
            <DropdownMenuItem
              key={langCode}
              onClick={() => changeLanguage(langCode)}
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
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
