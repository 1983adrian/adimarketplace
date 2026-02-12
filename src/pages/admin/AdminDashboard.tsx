import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Crown,
  Shield,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { usePlatformStats, useAllOrders } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { usePlatformSettings } from '@/hooks/useAdminSettings';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function AdminDashboard() {
  const { formatPriceWithRON } = useCurrency();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = usePlatformStats();
  const { data: recentOrders, refetch: refetchOrders } = useAllOrders();
  const { data: platformSettings } = usePlatformSettings();

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
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitorizare platformă în timp real</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizează
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/admin/settings">
                <Shield className="h-3.5 w-3.5" />
                Securitate
                {isSecurityMaximum ? (
                  <Badge variant="secondary" className="ml-1 bg-green-500/20 text-green-600 text-[10px] px-1 py-0">OK</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-1 text-[10px] px-1 py-0">!</Badge>
                )}
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/admin/settings">
                <Settings className="h-3.5 w-3.5" />
                Setări
              </Link>
            </Button>
          </div>
        </div>

        {/* Security Alert */}
        {!isSecurityMaximum && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="py-2.5 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Securitate incompletă — activează toate opțiunile</p>
                </div>
                <Button asChild size="sm" variant="outline" className="h-7 text-xs border-amber-500/50">
                  <Link to="/admin/settings">Configurează</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Utilizatori', value: stats?.totalUsers, icon: Users, color: 'blue' },
            { label: 'Vânzători', value: stats?.activeSellers, icon: Crown, color: 'amber' },
            { label: 'Produse Active', value: stats?.activeListings, icon: Package, color: 'green' },
            { label: 'Comenzi', value: stats?.totalOrders, icon: ShoppingCart, color: 'purple' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className={`h-4 w-4 text-${color}-500`} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {statsLoading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{value?.toLocaleString() || 0}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              Venituri din Abonamente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{formatPriceWithRON(stats?.totalRevenue || 0)}</span>
                <Badge variant="secondary" className="text-xs">0% comision vânzări</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Comenzi Recente</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2.5 rounded-lg border text-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{order.listings?.title || 'Produs'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('ro-RO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{formatPriceWithRON(Number(order.amount))}</span>
                      <Badge variant="secondary" className={`text-xs ${
                        order.status === 'paid' ? 'bg-green-500/10 text-green-600' :
                        order.status === 'shipped' ? 'bg-blue-500/10 text-blue-600' :
                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                        ''
                      }`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Nicio comandă încă</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
