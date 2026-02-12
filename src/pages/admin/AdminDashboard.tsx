import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Crown,
  Eye,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap,
  RefreshCw,
  CreditCard,
  Wallet,
  Scan
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { usePlatformStats, useAllOrders } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminChecklist } from '@/components/admin/AdminChecklist';
import { PaymentComplianceAudit } from '@/components/admin/PaymentComplianceAudit';
import { PlatformAudit } from '@/components/admin/PlatformAudit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { usePlatformSettings } from '@/hooks/useAdminSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function AdminDashboard() {
  const { formatPriceWithRON } = useCurrency();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = usePlatformStats();
  const { data: recentOrders, refetch: refetchOrders } = useAllOrders();
  const { data: platformSettings } = usePlatformSettings();

  // Check security status
  const securitySettings = platformSettings?.security_advanced as any;
  const isSecurityMaximum = securitySettings?.authentication?.leakedPasswordProtection && 
    securitySettings?.authentication?.twoFactorAuth && 
    securitySettings?.rateLimit?.enabled;

  const handleRefresh = () => {
    refetchStats();
    refetchOrders();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Dashboard Admin
            </h1>
            <p className="text-xs text-muted-foreground">Monitorizează și gestionează marketplace-ul</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="gap-1 h-8 text-xs hover:bg-primary/10 transition-all"
            >
              <RefreshCw className="h-3 w-3" />
              Actualizează
            </Button>
            <Button 
              asChild 
              size="sm"
              className="gap-1 h-8 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Link to="/admin/security">
                <Shield className="h-3 w-3" />
                Securitate
                {isSecurityMaximum ? (
                  <Badge variant="secondary" className="ml-0.5 bg-green-500/20 text-green-600 text-[10px] px-1 py-0">MAX</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-0.5 text-[10px] px-1 py-0">!</Badge>
                )}
              </Link>
            </Button>
            <Button 
              asChild 
              size="sm"
              className="gap-1 h-8 text-xs bg-gradient-to-r from-primary to-primary/80"
            >
              <Link to="/admin/settings">
                <Settings className="h-3 w-3" />
                Setări
              </Link>
            </Button>
          </div>
        </div>

        {/* Security Alert if not maximum - Compact */}
        {!isSecurityMaximum && (
          <Card className="border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <CardContent className="py-2 px-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Securitate incompletă</p>
                </div>
                <Button asChild size="sm" variant="outline" className="h-7 text-xs border-amber-500/50 hover:bg-amber-500/10">
                  <Link to="/admin/security">
                    Activează
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Compact Design */}
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <CardTitle className="text-xs font-medium">Utilizatori</CardTitle>
              <div className="p-1.5 bg-blue-500/10 rounded-md">
                <Users className="h-3 w-3 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {statsLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <TrendingUp className="h-2 w-2 text-green-500" />
                    Conturi
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <CardTitle className="text-xs font-medium">Vânzători</CardTitle>
              <div className="p-1.5 bg-amber-500/10 rounded-md">
                <Crown className="h-3 w-3 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {statsLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.activeSellers?.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Zap className="h-2 w-2 text-amber-500" />
                    Activi
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <CardTitle className="text-xs font-medium">Listări</CardTitle>
              <div className="p-1.5 bg-green-500/10 rounded-md">
                <Package className="h-3 w-3 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {statsLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.activeListings?.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground">
                    din {stats?.totalListings?.toLocaleString()}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <CardTitle className="text-xs font-medium">Comenzi</CardTitle>
              <div className="p-1.5 bg-purple-500/10 rounded-md">
                <ShoppingCart className="h-3 w-3 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {statsLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalOrders?.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue - Subscription Based */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-3">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              Venituri din Abonamente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {formatPriceWithRON(stats?.totalRevenue || 0)}
                </div>
                <Badge variant="secondary" className="text-xs">0% comision vânzări</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity - Compact */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 p-3">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Activity className="h-4 w-4 text-purple-500" />
              Comenzi Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-1.5">
                {recentOrders.slice(0, 3).map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-2 rounded-lg border hover:border-primary/30 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-1.5 bg-muted rounded">
                        <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{order.listings?.title || 'Produs'}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('ro-RO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{formatPriceWithRON(Number(order.amount))}</p>
                      <Badge 
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 ${
                          order.status === 'paid' ? 'bg-green-500/10 text-green-600' :
                          order.status === 'shipped' ? 'bg-blue-500/10 text-blue-600' :
                          order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                          ''
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Nicio comandă</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Tabs - Compact */}
        <Tabs defaultValue="full-audit" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-0.5 bg-muted/50 rounded-lg">
            <TabsTrigger 
              value="full-audit" 
              className="gap-1 py-2 text-xs rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow transition-all"
            >
              <Scan className="h-3 w-3" />
              Audit
            </TabsTrigger>
            <TabsTrigger 
              value="checklist" 
              className="gap-1 py-2 text-xs rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow transition-all"
            >
              <CheckCircle className="h-3 w-3" />
              eBay
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="gap-1 py-2 text-xs rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow transition-all"
            >
              <CreditCard className="h-3 w-3" />
              Plăți
            </TabsTrigger>
          </TabsList>
          <TabsContent value="full-audit" className="mt-3">
            <PlatformAudit />
          </TabsContent>
          <TabsContent value="checklist" className="mt-3">
            <AdminChecklist />
          </TabsContent>
          <TabsContent value="compliance" className="mt-3">
            <PaymentComplianceAudit />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
