import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

interface SalesData {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  platformEarnings: number;
  buyerFees: number;
  sellerCommissions: number;
  averageOrderValue: number;
  todayOrders: number;
  todayRevenue: number;
  topSellers: Array<{ name: string; sales: number; revenue: number }>;
  recentSuspiciousActivity: Array<{ userId: string; reason: string; severity: string }>;
  pendingPayouts: number;
}

export function AISalesManager() {
  const [analysis, setAnalysis] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-sales-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('ai-sales-manager', {
        body: { action: 'fetch' }
      });

      if (response.error) throw response.error;
      return response.data as { salesData: SalesData };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('ai-sales-manager', {
        body: { action: 'analyze' }
      });

      if (response.error) throw response.error;
      return response.data as { salesData: SalesData; analysis: string };
    },
    onSuccess: (result) => {
      setAnalysis(result.analysis);
      toast.success('Analiză AI generată cu succes!');
    },
    onError: (error) => {
      toast.error('Eroare la generarea analizei: ' + error.message);
    }
  });

  const salesData = data?.salesData;

  const stats = [
    { 
      label: 'Total Comenzi', 
      value: salesData?.totalOrders || 0, 
      icon: ShoppingCart, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    { 
      label: 'Comenzi Plătite', 
      value: salesData?.paidOrders || 0, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    { 
      label: 'În Așteptare', 
      value: salesData?.pendingOrders || 0, 
      icon: Clock, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    { 
      label: 'Expediate', 
      value: salesData?.shippedOrders || 0, 
      icon: Truck, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    { 
      label: 'Livrate', 
      value: salesData?.deliveredOrders || 0, 
      icon: CheckCircle, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20'
    },
    { 
      label: 'Anulate', 
      value: salesData?.cancelledOrders || 0, 
      icon: XCircle, 
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/60">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Sales Manager</h2>
            <p className="text-muted-foreground">Monitorizare și analiză automată a vânzărilor</p>
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
            className="gap-2"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generează Analiză AI
          </Button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-12" /> : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Venituri Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">£{(salesData?.totalRevenue || 0).toFixed(2)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              Câștiguri Platformă
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">£{(salesData?.platformEarnings || 0).toFixed(2)}</div>
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                  <span>Taxe: £{(salesData?.buyerFees || 0).toFixed(2)}</span>
                  <span>•</span>
                  <span>Comisioane: £{(salesData?.sellerCommissions || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-blue-600" />
              Valoare Medie Comandă
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">£{(salesData?.averageOrderValue || 0).toFixed(2)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4" />
              Plăți Pending Vânzători
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">£{(salesData?.pendingPayouts || 0).toFixed(2)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today Stats */}
      <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statistici Live - Astăzi</p>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Comenzi Astăzi</p>
                <p className="text-xl font-bold text-green-600">
                  {isLoading ? <Skeleton className="h-6 w-8 inline-block" /> : salesData?.todayOrders || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Venituri Astăzi</p>
                <p className="text-xl font-bold text-primary">
                  {isLoading ? <Skeleton className="h-6 w-16 inline-block" /> : `£${(salesData?.todayRevenue || 0).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Top Vânzători
            </CardTitle>
            <CardDescription>Cei mai performanți vânzători</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : salesData?.topSellers && salesData.topSellers.length > 0 ? (
              <div className="space-y-3">
                {salesData.topSellers.map((seller, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                        i === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800' :
                        i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-muted-foreground">{seller.sales} vânzări</p>
                      </div>
                    </div>
                    <p className="font-bold text-primary">£{seller.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">Niciun vânzător încă</p>
            )}
          </CardContent>
        </Card>

        {/* Suspicious Activity Alerts */}
        <Card className={salesData?.recentSuspiciousActivity?.length ? 'border-red-500/30' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${salesData?.recentSuspiciousActivity?.length ? 'text-red-500' : 'text-muted-foreground'}`} />
              Alerte Activitate
            </CardTitle>
            <CardDescription>Activități suspecte detectate automat</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : salesData?.recentSuspiciousActivity && salesData.recentSuspiciousActivity.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {salesData.recentSuspiciousActivity.map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                        alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{alert.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          User: {alert.userId.slice(0, 8)}...
                        </p>
                      </div>
                      <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                        {alert.severity === 'high' ? 'Urgent' : 'Atenție'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">Nicio activitate suspectă detectată</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Analiză AI
            </CardTitle>
            <CardDescription>Sugestii și predicții generate de AI</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {analysis}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Quick Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Sugestii Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {salesData?.pendingOrders && salesData.pendingOrders > 5 && (
              <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-700 dark:text-yellow-400">Comenzi Pending</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ai {salesData.pendingOrders} comenzi în așteptare. Verifică dacă sunt probleme cu plățile.
                </p>
              </div>
            )}
            
            {salesData?.pendingPayouts && salesData.pendingPayouts > 500 && (
              <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-700 dark:text-orange-400">Plăți Restante</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  £{salesData.pendingPayouts.toFixed(2)} de plătit vânzătorilor. Procesează plățile pentru a menține încrederea.
                </p>
              </div>
            )}

            {salesData?.cancelledOrders && salesData.cancelledOrders > 0 && (
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-700 dark:text-red-400">Anulări</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {salesData.cancelledOrders} comenzi anulate. Analizează motivele pentru a reduce rata de anulare.
                </p>
              </div>
            )}

            {salesData?.topSellers && salesData.topSellers.length === 0 && (
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-700 dark:text-blue-400">Atrage Vânzători</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nu ai încă vânzători activi. Promovează platforma pentru a atrage mai mulți comercianți.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
