import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Wrench, 
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  HardDrive,
  Shield,
  Zap,
  Activity,
  Lock,
  Sparkles,
  Play,
  Settings2,
  Heart,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface MaintenanceIssue {
  id: string;
  category: "database" | "storage" | "auth" | "edge_functions" | "data_integrity" | "performance" | "security";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  autoFixable: boolean;
  fixAction?: string;
  detectedAt: string;
}

interface MaintenanceReport {
  timestamp: string;
  status: "healthy" | "issues_detected" | "critical";
  issuesFound: number;
  issuesFixed: number;
  issues: MaintenanceIssue[];
  systemHealth: {
    database: number;
    storage: number;
    auth: number;
    edgeFunctions: number;
    dataIntegrity: number;
    performance: number;
    security: number;
    overall: number;
  };
  aiAnalysis?: string;
  recommendations: string[];
  autoFixLog?: string[];
}

const categoryIcons = {
  database: Database,
  storage: HardDrive,
  auth: Shield,
  edge_functions: Zap,
  data_integrity: Activity,
  performance: TrendingUp,
  security: Lock,
};

const categoryColors = {
  database: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  storage: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  auth: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  edge_functions: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  data_integrity: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  performance: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20',
  security: 'text-red-600 bg-red-100 dark:bg-red-900/20',
};

const severityColors = {
  info: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const getHealthColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
};

const getHealthBgColor = (score: number) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
};

export function AIMaintenanceDashboard() {
  const [selectedIssue, setSelectedIssue] = useState<MaintenanceIssue | null>(null);
  const [showFullRepairDialog, setShowFullRepairDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['ai-maintenance-report'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('ai-maintenance', {
        body: { action: 'scan' }
      });

      if (response.error) throw response.error;
      return response.data as MaintenanceReport;
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('ai-maintenance', {
        body: { action: 'analyze' }
      });

      if (response.error) throw response.error;
      return response.data as MaintenanceReport;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-maintenance-report'], data);
      toast.success('Analiză AI completă!');
    },
    onError: (error) => {
      toast.error('Eroare: ' + error.message);
    }
  });

  const fixIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('ai-maintenance', {
        body: { action: 'auto_fix', issueId }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast.success('Problemă reparată cu succes!');
      setSelectedIssue(null);
      refetch();
    },
    onError: (error) => {
      toast.error('Eroare la reparare: ' + error.message);
    }
  });

  const fullRepairMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('ai-maintenance', {
        body: { action: 'full_auto_repair' }
      });

      if (response.error) throw response.error;
      return response.data as MaintenanceReport;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-maintenance-report'], data);
      toast.success(`Reparare completă! ${data.issuesFixed} probleme rezolvate.`);
      setShowFullRepairDialog(false);
    },
    onError: (error) => {
      toast.error('Eroare: ' + error.message);
    }
  });

  const statusColors = {
    healthy: 'bg-green-500',
    issues_detected: 'bg-yellow-500',
    critical: 'bg-red-500'
  };

  const statusLabels = {
    healthy: 'Sănătos',
    issues_detected: 'Probleme Detectate',
    critical: 'Critic'
  };

  const fixableIssues = report?.issues.filter(i => i.autoFixable) || [];
  const criticalIssues = report?.issues.filter(i => i.severity === 'critical') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Maintenance PRO
            </h1>
            <p className="text-muted-foreground">
              Monitorizare și reparare automată COMPLETĂ a platformei 
              <Badge variant="outline" className="ml-2 text-xs border-emerald-500 text-emerald-600">
                ⚡ Putere Completă de Reparare
              </Badge>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Scanează
          </Button>
          <Button 
            onClick={() => analyzeMutation.mutate()} 
            disabled={analyzeMutation.isPending}
            variant="outline"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Analiză AI
          </Button>
          {fixableIssues.length > 0 && (
            <Button 
              onClick={() => setShowFullRepairDialog(true)}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              <Play className="h-4 w-4" />
              Reparare Automată ({fixableIssues.length})
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {report && (
        <Card className={`border-2 ${
          report.status === 'critical' ? 'border-red-500/50 bg-red-50 dark:bg-red-900/10' :
          report.status === 'issues_detected' ? 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10' :
          'border-green-500/50 bg-green-50 dark:bg-green-900/10'
        }`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${statusColors[report.status]}`}>
                  {report.status === 'healthy' ? (
                    <Heart className="h-5 w-5 text-white" />
                  ) : report.status === 'critical' ? (
                    <XCircle className="h-5 w-5 text-white" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{statusLabels[report.status]}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.issuesFound} probleme detectate 
                    {report.issuesFixed > 0 && ` • ${report.issuesFixed} reparate`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${getHealthColor(report.systemHealth.overall)}`}>
                  {report.systemHealth.overall}%
                </p>
                <p className="text-sm text-muted-foreground">Sănătate Generală</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Metrics Grid */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(report.systemHealth).filter(([key]) => key !== 'overall').map(([key, value]) => {
            const Icon = categoryIcons[key as keyof typeof categoryIcons] || Settings2;
            const colorClass = categoryColors[key as keyof typeof categoryColors];
            
            return (
              <Card key={key} className="overflow-hidden">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-md ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs capitalize font-medium">{key.replace('_', ' ')}</span>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-2xl font-bold ${getHealthColor(value)}`}>{value}%</p>
                    <Progress value={value} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issues List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Probleme Detectate
            </CardTitle>
            <CardDescription>
              Probleme care necesită atenție ({report?.issuesFound || 0})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : report?.issues && report.issues.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {report.issues.map((issue) => {
                    const Icon = categoryIcons[issue.category] || Settings2;
                    return (
                      <div 
                        key={issue.id} 
                        className={`p-4 rounded-lg border ${
                          issue.severity === 'critical' ? 'border-red-500/50 bg-red-50 dark:bg-red-900/10' :
                          issue.severity === 'error' ? 'border-orange-500/50 bg-orange-50 dark:bg-orange-900/10' :
                          'hover:bg-muted/50'
                        } transition-colors`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${categoryColors[issue.category]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{issue.title}</p>
                              <Badge className={severityColors[issue.severity]}>
                                {issue.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground capitalize">
                                {issue.category.replace('_', ' ')}
                              </span>
                              {issue.autoFixable && (
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Auto-reparabil
                                </Badge>
                              )}
                            </div>
                          </div>
                          {issue.autoFixable && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedIssue(issue)}
                            >
                              Repară
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Totul funcționează perfect!</p>
                <p className="text-muted-foreground">Nu au fost detectate probleme</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis & Recommendations */}
        <div className="space-y-6">
          {/* Auto-Fix Log */}
          {report?.autoFixLog && report.autoFixLog.length > 0 && (
            <Card className="border-green-500/50 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-green-500" />
                  Log Reparări Automate
                </CardTitle>
                <CardDescription>
                  Acțiuni executate în ultima sesiune
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 font-mono text-sm">
                    {report.autoFixLog.map((log, i) => (
                      <div 
                        key={i} 
                        className={`p-2 rounded ${
                          log.includes('✅') ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                          log.includes('❌') ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
                          'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {report?.aiAnalysis && (
            <Card className="border-primary/30 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Analiză AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {report.aiAnalysis}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {report?.recommendations && report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Recomandări
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Statistici Rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">
                  {report?.issues.filter(i => i.severity === 'warning').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Avertismente</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">
                  {criticalIssues.length}
                </p>
                <p className="text-sm text-muted-foreground">Critice</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {fixableIssues.length}
                </p>
                <p className="text-sm text-muted-foreground">Auto-reparabile</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {report?.issuesFixed || 0}
                </p>
                <p className="text-sm text-muted-foreground">Reparate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fix Single Issue Dialog */}
      <AlertDialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Repară Problema</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să repari automat această problemă?
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedIssue?.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedIssue?.description}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedIssue && fixIssueMutation.mutate(selectedIssue.id)}
              disabled={fixIssueMutation.isPending}
            >
              {fixIssueMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wrench className="h-4 w-4 mr-2" />
              )}
              Repară
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Full Auto Repair Dialog */}
      <AlertDialog open={showFullRepairDialog} onOpenChange={setShowFullRepairDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Reparare Automată Completă
            </AlertDialogTitle>
            <AlertDialogDescription>
              AI-ul va repara automat toate cele {fixableIssues.length} probleme care pot fi rezolvate automat.
              <div className="mt-4 space-y-2">
                {fixableIssues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{issue.title}</span>
                  </div>
                ))}
                {fixableIssues.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ...și încă {fixableIssues.length - 5} probleme
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => fullRepairMutation.mutate()}
              disabled={fullRepairMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              {fullRepairMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Repară Tot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
