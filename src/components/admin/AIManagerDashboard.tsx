import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Brain, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Megaphone,
  Wallet,
  RefreshCw,
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Package,
  ShoppingCart,
  MessageCircle,
  Bell,
  ArrowUpRight,
  Eye,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface AIAction {
  id: string;
  module: string;
  action: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  requiresConfirmation: boolean;
  data: Record<string, unknown>;
  suggestedAt: string;
}

interface Alert {
  type: string;
  message: string;
  severity: string;
}

interface ModuleData {
  admin?: {
    totalUsers: number;
    newUsersToday: number;
    totalSellers: number;
    inactiveUsers: number;
    adminCount: number;
    moderatorCount: number;
  };
  sales?: {
    totalOrders: number;
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    paidOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    platformEarnings: number;
    averageOrderValue: number;
    conversionRate: string;
    suspiciousBuyers: Array<{ userId: string; orderCount: number }>;
    problematicSellers: Array<{ userId: string; cancellations: number }>;
  };
  moderation?: {
    openDisputes: number;
    resolvedDisputes: number;
    totalDisputes: number;
    problematicListings: number;
    potentialSpammers: number;
    activeListings: number;
    inactiveListings: number;
  };
  ads?: {
    activePromotions: number;
    totalImpressions: number;
    totalClicks: number;
    ctr: string;
    adSpend: string;
    topPerformingCategories: string[];
    suggestedBudget: string;
  };
  finance?: {
    totalRevenue: number;
    platformEarnings: number;
    buyerFeesCollected: number;
    sellerCommissions: number;
    pendingPayoutsCount: number;
    pendingPayoutsAmount: number;
    refundedAmount: number;
    refundRate: string;
    projectedMonthlyRevenue: string;
  };
}

const moduleIcons = {
  admin: Shield,
  sales: TrendingUp,
  moderation: Eye,
  ads: Megaphone,
  finance: Wallet,
};

const moduleColors = {
  admin: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  sales: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  moderation: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  ads: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  finance: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20',
};

const severityColors = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function AIManagerDashboard() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-manager-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('ai-manager', {
        body: { module: 'all', action: 'fetch' }
      });

      if (response.error) throw response.error;
      return response.data as { 
        moduleData: ModuleData; 
        alerts: Alert[]; 
        suggestedActions: AIAction[];
        timestamp: string;
      };
    },
    refetchInterval: 60000,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('ai-manager', {
        body: { module: 'all', action: 'analyze' }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (result) => {
      setAnalysis(result.analysis);
      toast.success('Analiză AI completă generată!');
    },
    onError: (error) => {
      toast.error('Eroare: ' + error.message);
    }
  });

  const executeAction = (action: AIAction) => {
    // In production, this would call an API to execute the action
    toast.success(`Acțiune executată: ${action.description}`);
    setSelectedAction(null);
    refetch();
  };

  const moduleData = data?.moduleData;
  const alerts = data?.alerts || [];
  const suggestedActions = data?.suggestedActions || [];

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI Manager
            </h1>
            <p className="text-muted-foreground">Control complet AdiMarket cu inteligență artificială</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizează
          </Button>
          <Button 
            onClick={() => analyzeMutation.mutate()} 
            disabled={analyzeMutation.isPending}
            className="gap-2 bg-gradient-to-r from-primary to-purple-600"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Analiză Completă AI
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-500/50 bg-gradient-to-r from-red-500/10 to-orange-500/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {criticalAlerts.length} Alerte Critice
                </p>
                <p className="text-sm text-muted-foreground">
                  {criticalAlerts.map(a => a.message).join(' • ')}
                </p>
              </div>
              <Bell className="h-5 w-5 text-red-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Module Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(moduleIcons).map(([key, Icon]) => {
          const colorClass = moduleColors[key as keyof typeof moduleColors];
          const hasAlerts = alerts.some(a => a.type === key);
          
          return (
            <Card 
              key={key} 
              className={`cursor-pointer transition-all hover:scale-105 ${activeTab === key ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {hasAlerts && (
                    <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="font-medium capitalize">{key}</p>
                <p className="text-xs text-muted-foreground">
                  {key === 'admin' && `${moduleData?.admin?.totalUsers || 0} users`}
                  {key === 'sales' && `£${(moduleData?.sales?.platformEarnings || 0).toFixed(0)}`}
                  {key === 'moderation' && `${moduleData?.moderation?.openDisputes || 0} dispute`}
                  {key === 'ads' && `${moduleData?.ads?.activePromotions || 0} active`}
                  {key === 'finance' && `£${(moduleData?.finance?.pendingPayoutsAmount || 0).toFixed(0)} pending`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Prezentare</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="moderation">Moderare</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="finance">Finanțe</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Suggested Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Acțiuni Sugerate AI
                </CardTitle>
                <CardDescription>Acțiuni recomandate care necesită confirmare</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : suggestedActions.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {suggestedActions.map((action) => {
                        const ModuleIcon = moduleIcons[action.module as keyof typeof moduleIcons] || Brain;
                        return (
                          <div 
                            key={action.id} 
                            className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-1.5 rounded-md ${moduleColors[action.module as keyof typeof moduleColors]}`}>
                                <ModuleIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{action.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={severityColors[action.severity]}>
                                    {action.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground capitalize">{action.module}</span>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => setSelectedAction(action)}
                                className="shrink-0"
                              >
                                Execută
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">Totul este în regulă!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  Toate Alertele
                </CardTitle>
                <CardDescription>Notificări din toate modulele</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : alerts.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {alerts.map((alert, i) => {
                        const ModuleIcon = moduleIcons[alert.type as keyof typeof moduleIcons] || AlertTriangle;
                        return (
                          <div 
                            key={i} 
                            className={`p-3 rounded-lg border ${
                              alert.severity === 'critical' ? 'border-red-500/50 bg-red-50 dark:bg-red-900/10' :
                              alert.severity === 'high' ? 'border-orange-500/50 bg-orange-50 dark:bg-orange-900/10' :
                              ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <ModuleIcon className={`h-4 w-4 ${
                                alert.severity === 'critical' || alert.severity === 'high' ? 'text-red-500' : 'text-muted-foreground'
                              }`} />
                              <p className="text-sm flex-1">{alert.message}</p>
                              <Badge className={severityColors[alert.severity as keyof typeof severityColors]}>
                                {alert.severity}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">Nicio alertă activă</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis */}
          {analysis && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Analiză AI Completă
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {analysis}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Utilizatori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.admin?.totalUsers || 0}</div>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +{moduleData?.admin?.newUsersToday || 0} astăzi
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Vânzători Activi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.admin?.totalSellers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Administratori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.admin?.adminCount || 0}</div>
                <p className="text-sm text-muted-foreground">
                  + {moduleData?.admin?.moderatorCount || 0} moderatori
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600">Venituri Totale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  £{(moduleData?.sales?.totalRevenue || 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Câștig Platformă</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  £{(moduleData?.sales?.platformEarnings || 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Comenzi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.sales?.totalOrders || 0}</div>
                <p className="text-sm text-muted-foreground">
                  {moduleData?.sales?.paidOrders || 0} plătite
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Conversie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.sales?.conversionRate || 0}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className={moduleData?.moderation?.openDisputes ? 'border-orange-500/30' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Dispute Deschise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {moduleData?.moderation?.openDisputes || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Anunțuri Suspecte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.moderation?.problematicListings || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Potențiali Spammeri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.moderation?.potentialSpammers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Anunțuri Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.moderation?.activeListings || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ads Tab */}
        <TabsContent value="ads" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Promoții Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.ads?.activePromotions || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Impresii</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(moduleData?.ads?.totalImpressions || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">CTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{moduleData?.ads?.ctr || 0}%</div>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-600">Buget Recomandat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  £{moduleData?.ads?.suggestedBudget || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600">Venituri Totale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  £{(moduleData?.finance?.totalRevenue || 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Taxe Colectate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  £{(moduleData?.finance?.buyerFeesCollected || 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className={moduleData?.finance?.pendingPayoutsAmount && moduleData.finance.pendingPayoutsAmount > 500 ? 'border-orange-500/30' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Plăți Restante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  £{(moduleData?.finance?.pendingPayoutsAmount || 0).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {moduleData?.finance?.pendingPayoutsCount || 0} plăți
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rată Rambursare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${Number(moduleData?.finance?.refundRate) > 10 ? 'text-red-600' : ''}`}>
                  {moduleData?.finance?.refundRate || 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmare Acțiune AI
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>{selectedAction?.description}</p>
              <div className="flex items-center gap-2">
                <Badge className={severityColors[selectedAction?.severity || 'low']}>
                  Severitate: {selectedAction?.severity}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  Modul: {selectedAction?.module}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Această acțiune necesită confirmarea ta înainte de execuție.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedAction && executeAction(selectedAction)}>
              Confirmă și Execută
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
