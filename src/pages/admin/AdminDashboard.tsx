import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
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
import { usePlatformStats, usePlatformFees, useAllOrders } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminChecklist } from '@/components/admin/AdminChecklist';
import { PaymentComplianceAudit } from '@/components/admin/PaymentComplianceAudit';
import { PlatformAudit } from '@/components/admin/PlatformAudit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { usePlatformSettings } from '@/hooks/useAdminSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = usePlatformStats();
  const { data: fees } = usePlatformFees();
  const { data: recentOrders, refetch: refetchOrders } = useAllOrders();
  const { data: platformSettings } = usePlatformSettings();

  const buyerFee = fees?.find(f => f.fee_type === 'buyer_fee');
  const sellerCommission = fees?.find(f => f.fee_type === 'seller_commission');
  const sellerSub = fees?.find(f => f.fee_type === 'seller_subscription');

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
      <div className="space-y-6">
        {/* Header with Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground">Monitorizează și gestionează marketplace-ul</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="gap-2 hover:bg-primary/10 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizează
            </Button>
            <Button 
              asChild 
              size="sm"
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Link to="/admin/security">
                <Shield className="h-4 w-4" />
                Securitate
                {isSecurityMaximum ? (
                  <Badge variant="secondary" className="ml-1 bg-green-500/20 text-green-600 text-xs">MAX</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-1 text-xs">!</Badge>
                )}
              </Link>
            </Button>
            <Button 
              asChild 
              size="sm"
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              <Link to="/admin/settings">
                <Settings className="h-4 w-4" />
                Setări
              </Link>
            </Button>
          </div>
        </div>

        {/* Security Alert if not maximum */}
        {!isSecurityMaximum && (
          <Card className="border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">Securitate incompletă</p>
                    <p className="text-sm text-muted-foreground">Unele setări de securitate nu sunt activate</p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="border-amber-500/50 hover:bg-amber-500/10">
                  <Link to="/admin/security">
                    Activează Securitate Maximă
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Modern Design */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Utilizatori Totali</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats?.totalUsers?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    Conturi înregistrate
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vânzători Activi</CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Crown className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats?.activeSellers?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Zap className="h-3 w-3 text-amber-500" />
                    Cu abonament activ
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Listări Active</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Package className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats?.activeListings?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    din {stats?.totalListings?.toLocaleString()} total
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comenzi Totale</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats?.totalOrders?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Din toate timpurile</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Fees - Modern Design */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Venituri Platformă
              </CardTitle>
              <CardDescription>Total încasări din comenzi finalizate</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {statsLoading ? (
                <Skeleton className="h-12 w-32" />
              ) : (
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  £{stats?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/5">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-500" />
                Structură Comisioane
              </CardTitle>
              <CardDescription>Taxe active ale platformei</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                <span className="text-sm font-medium">Taxă Cumpărător</span>
                <Badge variant="secondary" className="font-bold">£{buyerFee?.amount?.toFixed(2) || '2.00'}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-green-500/5 to-green-500/10 border border-green-500/20">
                <span className="text-sm font-medium">Comision Vânzător</span>
                <Badge variant="secondary" className="font-bold">{sellerCommission?.amount || 20}%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-amber-500/10 border border-amber-500/20">
                <span className="text-sm font-medium">Abonament Vânzător</span>
                <Badge variant="secondary" className="font-bold">£{sellerSub?.amount?.toFixed(2) || '1.00'}/lună</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Modern Design */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-500/5">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Comenzi Recente
            </CardTitle>
            <CardDescription>Ultimele tranzacții pe platformă</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{order.listings?.title || 'Produs necunoscut'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('ro-RO')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className="font-bold text-lg">£{Number(order.amount).toFixed(2)}</p>
                      <Badge 
                        variant={
                          order.status === 'paid' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'shipped' ? 'outline' :
                          order.status === 'delivered' ? 'default' :
                          'destructive'
                        }
                        className={
                          order.status === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                          order.status === 'shipped' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          ''
                        }
                      >
                        {order.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nicio comandă încă</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Tabs */}
        <Tabs defaultValue="full-audit" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger 
              value="full-audit" 
              className="gap-2 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Scan className="h-4 w-4" />
              Audit Complet
            </TabsTrigger>
            <TabsTrigger 
              value="checklist" 
              className="gap-2 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              vs eBay
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="gap-2 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <CreditCard className="h-4 w-4" />
              Plăți
            </TabsTrigger>
          </TabsList>
          <TabsContent value="full-audit" className="mt-6">
            <PlatformAudit />
          </TabsContent>
          <TabsContent value="checklist" className="mt-6">
            <AdminChecklist />
          </TabsContent>
          <TabsContent value="compliance" className="mt-6">
            <PaymentComplianceAudit />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
