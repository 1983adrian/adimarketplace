import React from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
  currency: Currency;
  currencyName: string;
}

const languageOptions: LanguageOption[] = [
  { code: 'ro', name: 'Română', flag: '🇷🇴', currency: 'RON', currencyName: 'Lei' },
  { code: 'en', name: 'English', flag: '🇬🇧', currency: 'GBP', currencyName: 'Pounds' },
];

export const LanguageCurrencySelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { setCurrency } = useCurrency();
  
  const currentOption = languageOptions.find(l => l.code === language) || languageOptions[0];

  const handleSelect = (option: LanguageOption) => {
    setLanguage(option.code);
    setCurrency(option.currency);
    localStorage.setItem('preferredLanguage', option.code);
    localStorage.setItem('currency', option.currency);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 px-3 font-medium">
          <span className="text-lg">{currentOption.flag}</span>
          <span className="hidden sm:inline">{currentOption.name}</span>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => handleSelect(option)}
            className={`cursor-pointer gap-3 py-3 ${language === option.code ? 'bg-primary/10' : ''}`}
          >
            <span className="text-xl">{option.flag}</span>
            <div className="flex-1">
              <p className="font-medium">{option.name}</p>
              <p className="text-xs text-muted-foreground">{option.currencyName}</p>
            </div>
            {language === option.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
