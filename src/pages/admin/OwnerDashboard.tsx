import { useState } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Crown,
  Eye,
  Activity,
  MapPin,
  Globe,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Banknote
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { usePlatformStats, usePlatformFees, useAllOrders, useAllUsers, useAllListings } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Mock data for charts - în aplicația reală, acestea vor fi din DB
const revenueData = [
  { month: 'Ian', revenue: 1200, orders: 45, fees: 180 },
  { month: 'Feb', revenue: 1800, orders: 62, fees: 270 },
  { month: 'Mar', revenue: 1500, orders: 58, fees: 225 },
  { month: 'Apr', revenue: 2200, orders: 78, fees: 330 },
  { month: 'Mai', revenue: 2800, orders: 92, fees: 420 },
  { month: 'Iun', revenue: 3500, orders: 110, fees: 525 },
];

const locationData = [
  { city: 'London', sales: 45, amount: 4500 },
  { city: 'Manchester', sales: 32, amount: 3200 },
  { city: 'Birmingham', sales: 28, amount: 2800 },
  { city: 'Leeds', sales: 22, amount: 2200 },
  { city: 'Glasgow', sales: 18, amount: 1800 },
];

const paymentStatusData = [
  { name: 'Plătite', value: 65, color: '#22c55e' },
  { name: 'În așteptare', value: 20, color: '#eab308' },
  { name: 'Expediate', value: 10, color: '#3b82f6' },
  { name: 'Anulate', value: 5, color: '#ef4444' },
];

export default function OwnerDashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = usePlatformStats();
  const { data: fees } = usePlatformFees();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: users } = useAllUsers();
  const { data: listings } = useAllListings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate online users (în producție, folosești Supabase Realtime)
  const { data: onlineUsers } = useQuery({
    queryKey: ['online-users'],
    queryFn: async () => {
      // În producție, vei folosi Supabase Realtime presence
      // Pentru demo, returnăm un număr random
      return Math.floor(Math.random() * 50) + 10;
    },
    refetchInterval: 30000,
  });

  const buyerFee = fees?.find(f => f.fee_type === 'buyer_fee');
  const sellerCommission = fees?.find(f => f.fee_type === 'seller_commission');
  const sellerSub = fees?.find(f => f.fee_type === 'seller_subscription');

  // Calculate earnings
  const totalGMV = orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
  const paidOrders = orders?.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered') || [];
  const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
  const totalPaidAmount = paidOrders.reduce((sum, o) => sum + Number(o.amount), 0);
  
  // Platform earnings (buyer fees + seller commissions)
  const buyerFeeTotal = paidOrders.length * (buyerFee?.amount || 2);
  const sellerCommissionTotal = totalPaidAmount * ((sellerCommission?.amount || 15) / 100);
  const platformEarnings = buyerFeeTotal + sellerCommissionTotal;

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
            <p className="text-muted-foreground">Tablou de bord complet pentru deținătorul marketplace-ului</p>
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
                  <p className="text-sm text-muted-foreground">Utilizatori Online Acum</p>
                  <p className="text-2xl font-bold">{onlineUsers || 0}</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Comenzi Astăzi</p>
                  <p className="text-xl font-bold text-green-600">
                    {orders?.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Venituri Astăzi</p>
                  <p className="text-xl font-bold text-primary">
                    £{orders?.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
                      .reduce((sum, o) => sum + Number(o.amount), 0).toFixed(2) || '0.00'}
                  </p>
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
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString()}</div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> +12% față de luna trecută
                  </p>
                </>
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
                  <div className="text-2xl font-bold">{stats?.activeSellers?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Cu abonament activ</p>
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
              <div className="text-2xl font-bold">£{totalGMV.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Valoarea brută a mărfurilor</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Câștiguri Platformă</CardTitle>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">£{platformEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Taxe + Comisioane</p>
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
                  <p className="text-xl font-bold">£{buyerFeeTotal.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">£{buyerFee?.amount || 2} × {paidOrders.length} comenzi</p>
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
                  <p className="text-xl font-bold">£{sellerCommissionTotal.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{sellerCommission?.amount || 15}% din vânzări</p>
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
                  <p className="text-sm text-muted-foreground">Abonamente Vânzători</p>
                  <p className="text-xl font-bold">£{((stats?.activeSellers || 0) * (sellerSub?.amount || 1)).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{stats?.activeSellers || 0} × £{sellerSub?.amount || 1}/lună</p>
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
            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Evoluția Veniturilor
                  </CardTitle>
                  <CardDescription>Venituri și comenzi pe luni</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="fees" 
                          stroke="#22c55e" 
                          fill="#22c55e"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Status Comenzi
                  </CardTitle>
                  <CardDescription>Distribuția statusurilor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {paymentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4">
                      {paymentStatusData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-sm">{entry.name}</span>
                        </div>
                      ))}
                    </div>
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
                <CardDescription>Gestionează toate plățile de pe platformă</CardDescription>
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
                      {orders.slice(0, 20).map((order) => {
                        const orderAmount = Number(order.amount);
                        const buyerFeeAmount = buyerFee?.amount || 2;
                        const sellerCommissionAmount = orderAmount * ((sellerCommission?.amount || 15) / 100);
                        
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                            <TableCell>{order.listings?.title || 'N/A'}</TableCell>
                            <TableCell className="font-bold">£{orderAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-blue-600">£{buyerFeeAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-purple-600">£{sellerCommissionAmount.toFixed(2)}</TableCell>
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
                        );
                      })}
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
                <CardDescription>Toți vânzătorii de pe platformă</CardDescription>
              </CardHeader>
              <CardContent>
                {users ? (
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
                  <p className="text-center text-muted-foreground py-8">Se încarcă...</p>
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
                <CardDescription>Toți cumpărătorii de pe platformă</CardDescription>
              </CardHeader>
              <CardContent>
                {users ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nume</TableHead>
                        <TableHead>Email</TableHead>
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
                        const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.amount), 0);
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.display_name || 'N/A'}</TableCell>
                            <TableCell>user@email.com</TableCell>
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
                  <p className="text-center text-muted-foreground py-8">Se încarcă...</p>
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
                <CardDescription>Unde se vând cele mai multe produse</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="city" type="category" className="text-xs" width={80} />
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
