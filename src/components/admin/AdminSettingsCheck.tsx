import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Loader2,
  CreditCard,
  Mail,
  MessageSquare,
  Brain,
  Database,
  HardDrive,
  Settings,
  Zap,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceStatus {
  name: string;
  configured: boolean;
  working: boolean;
  details: string;
  error?: string;
}

interface CheckResponse {
  success: boolean;
  services: ServiceStatus[];
  summary: {
    workingCount: number;
    configuredCount: number;
    totalCount: number;
    percentage: number;
    overallStatus: 'all_working' | 'mostly_working' | 'needs_attention';
  };
  timestamp: string;
}

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'MangoPay Payments': CreditCard,
  'Resend Email': Mail,
  'Twilio SMS': MessageSquare,
  'Lovable AI Gateway': Brain,
  'Database (Supabase)': Database,
  'Storage (Supabase)': HardDrive,
  'Platform Fees': Settings,
  'Edge Functions': Zap,
};

export function AdminSettingsCheck() {
  const [checkResults, setCheckResults] = useState<CheckResponse | null>(null);

  const checkMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-settings-check');
      if (error) throw error;
      return data as CheckResponse;
    },
    onSuccess: (data) => {
      setCheckResults(data);
      if (data.summary.overallStatus === 'all_working') {
        toast.success('Toate serviciile funcționează corect!');
      } else if (data.summary.overallStatus === 'mostly_working') {
        toast.warning('Unele servicii necesită atenție');
      } else {
        toast.error('Probleme detectate - verifică configurația');
      }
    },
    onError: (error) => {
      toast.error('Eroare la verificare: ' + error.message);
    }
  });

  const getStatusIcon = (service: ServiceStatus) => {
    if (service.working) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (service.configured) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (service: ServiceStatus) => {
    if (service.working) {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Funcțional</Badge>;
    } else if (service.configured) {
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Eroare</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Neconfigurat</Badge>;
    }
  };

  const getOverallStatusColor = () => {
    if (!checkResults) return 'text-muted-foreground';
    switch (checkResults.summary.overallStatus) {
      case 'all_working': return 'text-green-500';
      case 'mostly_working': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  const getOverallStatusText = () => {
    if (!checkResults) return 'Nevalidat';
    switch (checkResults.summary.overallStatus) {
      case 'all_working': return '✅ Toate Serviciile Funcționează';
      case 'mostly_working': return '⚠️ Funcționare Parțială';
      default: return '❌ Necesită Atenție';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Verificare Setări Admin
            </CardTitle>
            <CardDescription>
              Verifică în timp real dacă toate serviciile și API-urile sunt configurate corect
            </CardDescription>
          </div>
          <Button 
            onClick={() => checkMutation.mutate()} 
            disabled={checkMutation.isPending}
            className="gap-2"
          >
            {checkMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {checkMutation.isPending ? 'Se verifică...' : 'Verifică Acum'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        {checkResults && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-xl font-bold ${getOverallStatusColor()}`}>
                  {getOverallStatusText()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {checkResults.summary.workingCount} din {checkResults.summary.totalCount} servicii funcționează
                </p>
              </div>
              <div className={`text-4xl font-bold ${getOverallStatusColor()}`}>
                {checkResults.summary.percentage}%
              </div>
            </div>
            <Progress value={checkResults.summary.percentage} className="h-3" />
          </div>
        )}

        {/* Services Grid */}
        {checkResults && (
          <div className="grid gap-4 md:grid-cols-2">
            {checkResults.services.map((service) => {
              const IconComponent = serviceIcons[service.name] || Settings;
              return (
                <div 
                  key={service.name}
                  className={`p-4 rounded-lg border ${
                    service.working 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                      : service.configured 
                        ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800'
                        : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      service.working 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : service.configured 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <IconComponent className={`h-5 w-5 ${
                        service.working 
                          ? 'text-green-600' 
                          : service.configured 
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium">{service.name}</h4>
                        {getStatusBadge(service)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{service.details}</p>
                      {service.error && (
                        <p className="text-xs text-red-600 mt-1 truncate">
                          Eroare: {service.error}
                        </p>
                      )}
                    </div>
                    {getStatusIcon(service)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No results yet */}
        {!checkResults && !checkMutation.isPending && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Apasă "Verifică Acum" pentru a verifica toate setările și serviciile
            </p>
          </div>
        )}

        {/* Loading */}
        {checkMutation.isPending && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">
              Se verifică toate serviciile...
            </p>
          </div>
        )}

        {/* Timestamp */}
        {checkResults && (
          <p className="text-xs text-muted-foreground text-right">
            Ultima verificare: {new Date(checkResults.timestamp).toLocaleString('ro-RO')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
