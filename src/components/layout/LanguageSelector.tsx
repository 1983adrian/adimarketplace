import React from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border-2 border-blue-500/30 transition-all duration-200 hover:scale-105"
          title="Select Language"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 shadow-xl">
        <div className="px-2 py-2 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Select Language</span>
          </div>
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer flex items-center gap-3 py-2.5 ${
              language === lang.code 
                ? 'bg-primary/10 text-primary font-medium' 
                : ''
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
            {language === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
