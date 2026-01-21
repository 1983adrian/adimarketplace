import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  errors: string[];
  showErrors?: boolean;
}

export function PasswordStrengthIndicator({ 
  strength, 
  errors, 
  showErrors = true 
}: PasswordStrengthIndicatorProps) {
  const getStrengthConfig = () => {
    switch (strength) {
      case 'weak':
        return { 
          label: 'Slabă', 
          color: 'bg-red-500', 
          textColor: 'text-red-600',
          width: 'w-1/4',
          icon: XCircle,
        };
      case 'medium':
        return { 
          label: 'Medie', 
          color: 'bg-yellow-500', 
          textColor: 'text-yellow-600',
          width: 'w-2/4',
          icon: AlertTriangle,
        };
      case 'strong':
        return { 
          label: 'Puternică', 
          color: 'bg-green-500', 
          textColor: 'text-green-600',
          width: 'w-3/4',
          icon: CheckCircle,
        };
      case 'very-strong':
        return { 
          label: 'Foarte Puternică', 
          color: 'bg-emerald-600', 
          textColor: 'text-emerald-600',
          width: 'w-full',
          icon: Shield,
        };
    }
  };

  const config = getStrengthConfig();
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Putere parolă</span>
          <span className={cn('flex items-center gap-1 font-medium', config.textColor)}>
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn('h-full transition-all duration-300 rounded-full', config.color, config.width)} 
          />
        </div>
      </div>

      {/* Error messages */}
      {showErrors && errors.length > 0 && (
        <ul className="space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-xs text-destructive flex items-start gap-1.5">
              <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
