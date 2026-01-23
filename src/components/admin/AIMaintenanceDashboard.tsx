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
  TrendingUp,
  MessageCircle,
  Bell,
  ShoppingCart,
  Bot,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';

interface MaintenanceIssue {
  id: string;
  category: "database" | "storage" | "auth" | "chat" | "notifications" | "orders" | "data_integrity" | "performance" | "security";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  autoFixable: boolean;
  fixAction?: string;
  affectedCount?: number;
  detectedAt: string;
  fixedAt?: string;
  fixResult?: string;
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
    chat: number;
    notifications: number;
    orders: number;
    dataIntegrity: number;
    performance: number;
    security: number;
    overall: number;
  };
  aiAnalysis?: string;
  recommendations: string[];
  autoFixLog?: string[];
  proactiveRepairs?: string[];
}

const categoryIcons = {
  database: Database,
  storage: HardDrive,
  auth: Shield,
  chat: MessageCircle,
  notifications: Bell,
  orders: ShoppingCart,
  data_integrity: Activity,
  performance: TrendingUp,
  security: Lock,
};

const categoryColors = {
  database: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  storage: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  auth: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  chat: 'text-pink-600 bg-pink-100 dark:bg-pink-900/20',
  notifications: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20',
  orders: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20',
  data_integrity: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  performance: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20',
  security: 'text-red-600 bg-red-100 dark:bg-red-900/20',
};

const categoryLabels: Record<string, string> = {
  database: 'Bază Date',
  storage: 'Stocare',
  auth: 'Autentificare',
  chat: 'Chat',
  notifications: 'Notificări',
  orders: 'Comenzi',
  data_integrity: 'Integritate',
  performance: 'Performanță',
  security: 'Securitate',
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
        body: { action: 'scan', autoRepairEnabled: true }
      });

      if (response.error) throw response.error;
      return response.data as MaintenanceReport;
    },
    refetchInterval: 60000, // Auto-refresh every minute
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
    healthy: '✅ Totul Reparat',
    issues_detected: '⚠️ Probleme Detectate',
    critical: '🚨 Situație Critică'
  };

  const unfixedIssues = report?.issues.filter(i => !i.fixedAt) || [];
  const fixableIssues = unfixedIssues.filter(i => i.autoFixable);
  const criticalIssues = unfixedIssues.filter(i => i.severity === 'critical');
  const fixedIssues = report?.issues.filter(i => i.fixedAt) || [];

  // Get health metrics to display (excluding database since it's always 100)
  const healthMetrics = report?.systemHealth ? 
    Object.entries(report.systemHealth)
      .filter(([key]) => !['overall', 'database'].includes(key))
      .sort((a, b) => a[1] - b[1]) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
              AI Maintenance ULTRA PRO
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                <Cpu className="h-3 w-3 mr-1" />
                INGINER
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Repară AUTOMAT chat, notificări, comenzi, erori - tot ce ține de platformă
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Scanează & Repară
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
            Raport AI
          </Button>
          {fixableIssues.length > 0 && (
            <Button 
              onClick={() => setShowFullRepairDialog(true)}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              <Play className="h-4 w-4" />
              Repară Tot ({fixableIssues.length})
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
            <div className="flex items-center justify-between flex-wrap gap-4">
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
                    {report.issuesFound} detectate • {report.issuesFixed} reparate automat • {unfixedIssues.length} rămase
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${getHealthColor(report.systemHealth.overall)}`}>
                  {report.systemHealth.overall}%
                </p>
                <p className="text-sm text-muted-foreground">Sănătate Platformă</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proactive Repairs Log */}
      {report?.proactiveRepairs && report.proactiveRepairs.length > 0 && (
        <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-emerald-500" />
              🤖 Reparări Proactive Automate
            </CardTitle>
            <CardDescription>
              AI-ul a reparat automat aceste probleme la ultima scanare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              <div className="space-y-1.5 font-mono text-sm">
                {report.proactiveRepairs.map((log, i) => (
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

      {/* Health Metrics Grid */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {healthMetrics.map(([key, value]) => {
            const Icon = categoryIcons[key as keyof typeof categoryIcons] || Settings2;
            const colorClass = categoryColors[key as keyof typeof categoryColors];
            const label = categoryLabels[key] || key;
            
            return (
              <Card key={key} className="overflow-hidden">
                <CardContent className="pt-3 pb-2 px-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`p-1 rounded ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-medium truncate">{label}</span>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xl font-bold ${getHealthColor(value)}`}>{value}%</p>
                    <Progress value={value} className="h-1" />
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
              {unfixedIssues.length > 0 ? (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {unfixedIssues.length > 0 ? 'Probleme Rămase' : 'Totul Reparat!'}
            </CardTitle>
            <CardDescription>
              {unfixedIssues.length > 0 
                ? `${unfixedIssues.length} probleme necesită atenție`
                : 'AI-ul a reparat toate problemele detectate'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : unfixedIssues.length > 0 ? (
              <ScrollArea className="h-[350px]">
                <div className="space-y-3">
                  {unfixedIssues.map((issue) => {
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
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-medium">{issue.title}</p>
                              <Badge className={severityColors[issue.severity]}>
                                {issue.severity}
                              </Badge>
                              {issue.affectedCount && (
                                <Badge variant="outline" className="text-xs">
                                  {issue.affectedCount} afectate
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {categoryLabels[issue.category] || issue.category}
                              </span>
                              {issue.autoFixable && (
                                <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-600">
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
                              className="shrink-0"
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
                <div className="relative inline-block">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <Bot className="h-8 w-8 text-emerald-600 absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1" />
                </div>
                <p className="text-lg font-medium text-green-700 dark:text-green-400">
                  Platforma funcționează PERFECT!
                </p>
                <p className="text-muted-foreground">
                  Inginerul AI a reparat toate problemele automat
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis & Stats */}
        <div className="space-y-6">
          {/* AI Analysis */}
          {report?.aiAnalysis && (
            <Card className="border-primary/30 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Raport Inginer AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {report.aiAnalysis}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Auto-Fix Log */}
          {report?.autoFixLog && report.autoFixLog.length > 0 && (
            <Card className="border-green-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5 text-green-500" />
                  Log Reparări Manuale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-1.5 font-mono text-sm">
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

          {/* Recommendations */}
          {report?.recommendations && report.recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Status & Recomandări
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
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-purple-500" />
                Statistici
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {fixedIssues.length}
                </p>
                <p className="text-xs text-muted-foreground">Reparate Automat</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {unfixedIssues.filter(i => i.severity === 'warning').length}
                </p>
                <p className="text-xs text-muted-foreground">Avertismente</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {criticalIssues.length}
                </p>
                <p className="text-xs text-muted-foreground">Critice</p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {report?.systemHealth.overall || 0}%
                </p>
                <p className="text-xs text-muted-foreground">Sănătate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fix Single Issue Dialog */}
      <AlertDialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-emerald-500" />
              Repară Problema
            </AlertDialogTitle>
            <AlertDialogDescription>
              AI-ul va repara automat această problemă.
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedIssue?.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedIssue?.description}
                </p>
                {selectedIssue?.affectedCount && (
                  <Badge variant="outline" className="mt-2">
                    {selectedIssue.affectedCount} elemente afectate
                  </Badge>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedIssue && fixIssueMutation.mutate(selectedIssue.id)}
              disabled={fixIssueMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              {fixIssueMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bot className="h-4 w-4 mr-2" />
              )}
              Repară Acum
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
              Inginerul AI va repara automat toate cele {fixableIssues.length} probleme rămase.
              <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
                {fixableIssues.slice(0, 8).map((issue) => (
                  <div key={issue.id} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                    <Bot className="h-4 w-4 text-emerald-500" />
                    <span className="flex-1">{issue.title}</span>
                    {issue.affectedCount && (
                      <Badge variant="outline" className="text-xs">
                        {issue.affectedCount}
                      </Badge>
                    )}
                  </div>
                ))}
                {fixableIssues.length > 8 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    ...și încă {fixableIssues.length - 8} probleme
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
                <Bot className="h-4 w-4 mr-2" />
              )}
              Repară Tot Automat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
