import React from 'react';
import { Crown, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InlinePromotionOptionProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  price?: number; // RON
  duration?: number; // days
}

export const InlinePromotionOption: React.FC<InlinePromotionOptionProps> = ({
  enabled,
  onEnabledChange,
  price = 5,
  duration = 7,
}) => {
  return (
    <Card className={`border-2 transition-all ${enabled ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/30'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Promovează Produsul
                <Badge variant={enabled ? 'default' : 'secondary'} className="text-xs">
                  {price} RON / {duration} zile
                </Badge>
              </CardTitle>
              <CardDescription>
                Apare pe prima pagină și în topul rezultatelor
              </CardDescription>
            </div>
          </div>
          <Switch 
            checked={enabled} 
            onCheckedChange={onEnabledChange}
          />
        </div>
      </CardHeader>
      
      {enabled && (
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <div className="text-sm">
                <p className="font-medium">Homepage</p>
                <p className="text-muted-foreground text-xs">Vizibil pe prima pagină</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div className="text-sm">
                <p className="font-medium">Top Rezultate</p>
                <p className="text-muted-foreground text-xs">Prioritate în căutări</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
              <Clock className="h-4 w-4 text-blue-500" />
              <div className="text-sm">
                <p className="font-medium">{duration} Zile</p>
                <p className="text-muted-foreground text-xs">Promovare activă 24/7</p>
              </div>
            </div>
          </div>

          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
            <Crown className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Taxa de promovare:</strong> {price} RON va fi adăugată la publicarea produsului.
              Produsele promovate vând de până la <strong>3x mai repede</strong>!
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
};
