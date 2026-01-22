import { Ban, Leaf, Bomb, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PLATFORM_RULES = [
  { 
    icon: Ban, 
    label: 'Fără Armament', 
    description: 'Arme de foc, arme albe, muniție, explozibili sau orice obiect ce poate fi folosit ca armă' 
  },
  { 
    icon: Leaf, 
    label: 'Fără Substanțe Interzise', 
    description: 'Droguri, medicamente fără rețetă, substanțe controlate sau psihotrope' 
  },
  { 
    icon: Bomb, 
    label: 'Fără Contrabandă', 
    description: 'Bunuri furate, falsificate, importate ilegal sau fără documente legale' 
  },
];

interface PlatformRulesProps {
  variant?: 'alert' | 'inline' | 'compact';
  className?: string;
}

export const PlatformRules = ({ variant = 'alert', className = '' }: PlatformRulesProps) => {
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-3 text-sm text-muted-foreground ${className}`}>
        {PLATFORM_RULES.map((rule, index) => (
          <span key={index} className="flex items-center gap-1.5">
            <rule.icon className="h-4 w-4 text-red-500" />
            {rule.label}
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${className}`}>
        {PLATFORM_RULES.map((rule, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <rule.icon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700 text-sm">{rule.label}</p>
              <p className="text-xs text-red-600">{rule.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Alert className={`border-red-200 bg-red-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Reguli Platformă - Produse Interzise</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {PLATFORM_RULES.map((rule, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
              <rule.icon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700">{rule.label}</p>
                <p className="text-sm text-red-600">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export { PLATFORM_RULES };