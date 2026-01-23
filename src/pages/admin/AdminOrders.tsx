import { useState } from 'react';
import { Search, MoreHorizontal, Package, Truck, CheckCircle, XCircle, RefreshCw, AlertTriangle, Ban, Bomb, Leaf, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllOrders } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const statusOptions = [
  { value: 'all', label: 'Toate Comenzile' },
  { value: 'pending', label: 'În Așteptare' },
  { value: 'paid', label: 'Plătite' },
  { value: 'shipped', label: 'Expediate' },
  { value: 'delivered', label: 'Livrate' },
  { value: 'cancelled', label: 'Anulate' },
  { value: 'refunded', label: 'Rambursate' },
];

// Platform forbidden items rules
const PLATFORM_RULES = [
  { icon: Ban, label: 'Armament', description: 'Arme de foc, arme albe, muniție, explozibili' },
  { icon: Leaf, label: 'Substanțe Interzise', description: 'Droguri, medicamente fără rețetă, substanțe controlate' },
  { icon: Bomb, label: 'Contrabandă', description: 'Bunuri furate, falsificate sau importate ilegal' },
];

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: orders, isLoading } = useAllOrders();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.listings?.title?.toLowerCase().includes(search.toLowerCase()) ||
      order.id?.toLowerCase().includes(search.toLowerCase()) ||
      order.buyer_profile?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.seller_profile?.display_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: status as any })
        .eq('id', orderId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Status comandă actualizat' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">În Așteptare</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Plătit</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500">Expediat</Badge>;
      case 'delivered':
        return <Badge className="bg-purple-500">Livrat</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Anulat</Badge>;
      case 'refunded':
        return <Badge variant="outline">Rambursat</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderImage = (order: any) => {
    const primaryImage = order.listings?.listing_images?.find((img: any) => img.is_primary)?.image_url;
    return primaryImage || order.listings?.listing_images?.[0]?.image_url;
  };

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    paid: orders?.filter(o => o.status === 'paid').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    totalRevenue: orders?.filter(o => o.status === 'delivered').reduce((acc, o) => acc + Number(o.seller_commission || 0) + Number(o.buyer_fee || 0), 0) || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-4 w-full min-w-0 overflow-hidden">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Gestionare Comenzi</h1>
          <p className="text-sm text-muted-foreground">Vizualizează și gestionează toate comenzile platformei</p>
        </div>

        {/* Platform Rules Alert */}
        <Alert className="border-red-200 bg-red-50 overflow-hidden">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <AlertTitle className="text-red-800 text-sm">Reguli Platformă - Produse Interzise</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {PLATFORM_RULES.map((rule, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-red-100">
                  <rule.icon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-red-700 text-xs">{rule.label}</p>
                    <p className="text-xs text-red-600 break-words">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="p-0">
            <CardContent className="p-3">
              <div className="text-lg sm:text-xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-3">
              <div className="text-lg sm:text-xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Așteptare</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-3">
              <div className="text-lg sm:text-xl font-bold text-green-600">{stats.paid}</div>
              <p className="text-xs text-muted-foreground">Plătite</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-3">
              <div className="text-lg sm:text-xl font-bold text-blue-600">{stats.shipped}</div>
              <p className="text-xs text-muted-foreground">Expediate</p>
            </CardContent>
          </Card>
          <Card className="p-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white col-span-2 sm:col-span-1">
            <CardContent className="p-3">
              <div className="text-lg sm:text-xl font-bold">£{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-white/80">Venit</p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex flex-col gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Toate Comenzile</CardTitle>
                <CardDescription className="text-xs">{filteredOrders?.length || 0} comenzi găsite</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Caută comenzi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Poza</TableHead>
                    <TableHead>Produs</TableHead>
                    <TableHead>Cumpărător</TableHead>
                    <TableHead>Vânzător</TableHead>
                    <TableHead>Sumă</TableHead>
                    <TableHead>Comisioane</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const orderImage = getOrderImage(order);
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden">
                            {orderImage ? (
                              <img 
                                src={orderImage} 
                                alt={order.listings?.title || 'Produs'} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Image className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium truncate max-w-[150px]">{order.listings?.title || 'Produs Necunoscut'}</p>
                            <p className="text-xs text-muted-foreground font-mono">{order.id.slice(0, 8)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {order.buyer_profile?.display_name || order.buyer_profile?.username || 'Cumpărător'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {order.seller_profile?.display_name || order.seller_profile?.username || 'Vânzător'}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          £{Number(order.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <p className="text-green-600">+£{Number(order.seller_commission || 0).toFixed(2)} vânz.</p>
                            <p className="text-blue-600">+£{Number(order.buyer_fee || 0).toFixed(2)} cump.</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(order.created_at).toLocaleDateString('ro-RO')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actualizează Status</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'paid')}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Marchează Plătit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'shipped')}>
                                <Truck className="h-4 w-4 mr-2 text-blue-500" />
                                Marchează Expediat
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                                <Package className="h-4 w-4 mr-2 text-purple-500" />
                                Marchează Livrat
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Anulează Comandă
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'refunded')}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Marchează Rambursat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nu s-au găsit comenzi
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}