import { useState } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Crown,
  Activity,
  MapPin,
  CreditCard,
  Wallet,
  RefreshCw,
  CheckCircle,
  UserCheck,
  Banknote,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { usePlatformStats, usePlatformFees, useAllOrders, useAllUsers, useAllListings } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// MangoPay removed - using PayPal only
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function OwnerDashboard() {
  const queryClient = useQueryClient();
  const { formatPriceWithRON } = useCurrency();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: fees } = usePlatformFees();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: listings } = useAllListings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const buyerFee = fees?.find(f => f.fee_type === 'buyer_fee');
  const sellerCommission = fees?.find(f => f.fee_type === 'seller_commission');
  const weeklyPromotion = fees?.find(f => f.fee_type === 'weekly_promotion');

  // Calculate real data
  const totalGMV = orders?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;
  const paidOrders = orders?.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status)) || [];
  const totalPaidAmount = paidOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  
  // Platform earnings from real orders
  const buyerFeeTotal = paidOrders.reduce((sum, o) => sum + Number(o.buyer_fee || 0), 0);
  const sellerCommissionTotal = paidOrders.reduce((sum, o) => sum + Number(o.seller_commission || 0), 0);
  const platformEarnings = buyerFeeTotal + sellerCommissionTotal;

  // Today's stats
  const today = new Date().toDateString();
  const ordersToday = orders?.filter(o => new Date(o.created_at).toDateString() === today) || [];
  const revenueToday = ordersToday.reduce((sum, o) => sum + Number(o.amount || 0), 0);

  // Real order status distribution
  const orderStatusData = [
    { name: 'Plătite', value: orders?.filter(o => o.status === 'paid').length || 0, color: '#22c55e' },
    { name: 'În așteptare', value: orders?.filter(o => o.status === 'pending').length || 0, color: '#eab308' },
    { name: 'Expediate', value: orders?.filter(o => o.status === 'shipped').length || 0, color: '#3b82f6' },
    { name: 'Livrate', value: orders?.filter(o => o.status === 'delivered').length || 0, color: '#10b981' },
    { name: 'Anulate', value: orders?.filter(o => o.status === 'cancelled').length || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Real location data from orders
  const locationStats = orders?.reduce((acc, order) => {
    const location = order.shipping_address?.split(',').pop()?.trim() || 'Nedefinit';
    if (!acc[location]) acc[location] = { sales: 0, amount: 0 };
    acc[location].sales += 1;
    acc[location].amount += Number(order.amount || 0);
    return acc;
  }, {} as Record<string, { sales: number; amount: number }>) || {};

  const locationData = Object.entries(locationStats)
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setIsRefreshing(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground">Date live din baza de date</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizează
          </Button>
        </div>

        {/* Live Stats Banner */}
        <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Live</p>
                  <p className="text-lg font-bold">Actualizat acum</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Comenzi Astăzi</p>
                  <p className="text-xl font-bold text-green-600">{ordersToday.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Venituri Astăzi</p>
                  <p className="text-xl font-bold text-primary">{formatPriceWithRON(revenueToday)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Utilizatori</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vânzători Activi</CardTitle>
              <Crown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{stats?.activeSellers?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">Cu listări active</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">GMV Total</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPriceWithRON(totalGMV)}</div>
              <p className="text-xs text-muted-foreground">{orders?.length || 0} comenzi totale</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Câștiguri Platformă</CardTitle>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatPriceWithRON(platformEarnings)}</div>
              <p className="text-xs text-muted-foreground">Taxe + Comisioane reale</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxe Cumpărători</p>
                  <p className="text-xl font-bold">{formatPriceWithRON(buyerFeeTotal)}</p>
                  <p className="text-xs text-muted-foreground">Din {paidOrders.length} comenzi plătite</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Banknote className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comisioane Vânzători</p>
                  <p className="text-xl font-bold">{formatPriceWithRON(sellerCommissionTotal)}</p>
                  <p className="text-xs text-muted-foreground">{sellerCommission?.amount || 8}% din vânzări</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <Crown className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Promovări Plătite</p>
                  <p className="text-xl font-bold">{formatPriceWithRON(weeklyPromotion?.amount || 25)}/săptămână</p>
                  <p className="text-xs text-muted-foreground">Taxă promovare produs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Prezentare</TabsTrigger>
            <TabsTrigger value="payments">Plăți</TabsTrigger>
            <TabsTrigger value="sellers">Vânzători</TabsTrigger>
            <TabsTrigger value="buyers">Cumpărători</TabsTrigger>
            <TabsTrigger value="locations">Locații</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Order Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Status Comenzi
                  </CardTitle>
                  <CardDescription>Distribuția reală a statusurilor</CardDescription>
                </CardHeader>
                <CardContent>
                  {orderStatusData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-4 flex-wrap">
                        {orderStatusData.map((entry) => (
                          <div key={entry.name} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-sm">{entry.name} ({entry.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nu există comenzi încă</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Statistici Rapide
                  </CardTitle>
                  <CardDescription>Rezumat platforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>Total Anunțuri</span>
                    <span className="font-bold">{listings?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>Anunțuri Active</span>
                    <span className="font-bold">{stats?.activeListings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>Total Comenzi</span>
                    <span className="font-bold">{orders?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>Comenzi Plătite</span>
                    <span className="font-bold text-green-600">{paidOrders.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>Valoare Medie Comandă</span>
                    <span className="font-bold">
                      {orders && orders.length > 0 ? formatPriceWithRON(totalGMV / orders.length) : '0,00 RON'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Toate Tranzacțiile
                </CardTitle>
                <CardDescription>Date reale din baza de date</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Comandă</TableHead>
                        <TableHead>Produs</TableHead>
                        <TableHead>Sumă</TableHead>
                        <TableHead>Taxă Cumpărător</TableHead>
                        <TableHead>Comision Vânzător</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dată</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 20).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>{order.listings?.title || 'N/A'}</TableCell>
                          <TableCell className="font-bold">{formatPriceWithRON(Number(order.amount || 0))}</TableCell>
                          <TableCell className="text-blue-600">{formatPriceWithRON(Number(order.buyer_fee || 0))}</TableCell>
                          <TableCell className="text-purple-600">{formatPriceWithRON(Number(order.seller_commission || 0))}</TableCell>
                          <TableCell>
                            <Badge className={
                              order.status === 'paid' ? 'bg-green-100 text-green-700' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('ro-RO')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nicio comandă încă</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Gestionare Vânzători
                </CardTitle>
                <CardDescription>Date reale din profiluri</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : users && users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nume</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Locație</TableHead>
                        <TableHead>Anunțuri</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Data Înregistrării</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const userListings = listings?.filter(l => l.seller_id === user.user_id) || [];
                        const role = user.user_roles?.[0]?.role || 'user';
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.display_name || 'N/A'}</TableCell>
                            <TableCell>@{user.username || 'n/a'}</TableCell>
                            <TableCell>{user.phone || '-'}</TableCell>
                            <TableCell>{user.location || '-'}</TableCell>
                            <TableCell>{userListings.length}</TableCell>
                            <TableCell>
                              <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                                {role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString('ro-RO')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nu există utilizatori</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buyers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Gestionare Cumpărători
                </CardTitle>
                <CardDescription>Date reale din profiluri și comenzi</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : users && users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nume</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Locație</TableHead>
                        <TableHead>Comenzi</TableHead>
                        <TableHead>Total Cheltuit</TableHead>
                        <TableHead>Data Înregistrării</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const userOrders = orders?.filter(o => o.buyer_id === user.user_id) || [];
                        const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.display_name || 'N/A'}</TableCell>
                            <TableCell>@{user.username || 'n/a'}</TableCell>
                            <TableCell>{user.phone || '-'}</TableCell>
                            <TableCell>{user.location || '-'}</TableCell>
                            <TableCell>{userOrders.length}</TableCell>
                            <TableCell className="font-bold">£{totalSpent.toFixed(2)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString('ro-RO')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nu există utilizatori</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Vânzări pe Locații
                </CardTitle>
                <CardDescription>Date reale din comenzi</CardDescription>
              </CardHeader>
              <CardContent>
                {locationData.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" className="text-xs" />
                          <YAxis dataKey="city" type="category" className="text-xs" width={100} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {locationData.map((loc, i) => (
                        <div key={loc.city} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              i === 0 ? 'bg-yellow-100 text-yellow-700' :
                              i === 1 ? 'bg-gray-100 text-gray-700' :
                              i === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-medium">{loc.city}</p>
                              <p className="text-sm text-muted-foreground">{loc.sales} vânzări</p>
                            </div>
                          </div>
                          <p className="font-bold text-primary">£{loc.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nu există date despre locații încă</p>
                    <p className="text-sm">Datele vor apărea după primele comenzi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
