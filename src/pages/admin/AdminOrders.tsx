import { useState } from 'react';
import { Search, MoreHorizontal, Package, Truck, CheckCircle, XCircle, RefreshCw, AlertTriangle, Image, Clock, Bell, Edit3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllOrders } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrency } from '@/contexts/CurrencyContext';

const statusOptions = [
  { value: 'all', label: 'Toate Comenzile' },
  { value: 'pending', label: 'În Așteptare' },
  { value: 'payment_pending', label: 'Plată în Așteptare' },
  { value: 'paid', label: 'Plătite' },
  { value: 'shipped', label: 'Expediate' },
  { value: 'delivered', label: 'Livrate' },
  { value: 'cancelled', label: 'Anulate' },
  { value: 'refunded', label: 'Rambursate' },
];


const CARRIERS = [
  { value: 'fan_courier', label: 'FAN Courier' },
  { value: 'sameday', label: 'Sameday' },
  { value: 'cargus', label: 'Cargus' },
  { value: 'dpd', label: 'DPD' },
  { value: 'gls', label: 'GLS' },
  { value: 'posta_romana', label: 'Poșta Română' },
  { value: 'other', label: 'Altul' },
];

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [awbDialog, setAwbDialog] = useState<{ open: boolean; orderId: string; currentAwb: string; currentCarrier: string }>({
    open: false, orderId: '', currentAwb: '', currentCarrier: 'fan_courier'
  });
  const [awbInput, setAwbInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('fan_courier');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const { data: orders, isLoading } = useAllOrders();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatPriceWithRON } = useCurrency();

  // Orders missing tracking: paid/pending but no tracking number
  const missingTracking = orders?.filter(o => 
    ['paid', 'pending'].includes(o.status) && !o.tracking_number
  ) || [];

  // Group sales by seller
  const sellerSales = orders?.reduce((acc, order) => {
    const sellerId = order.seller_id;
    const sellerName = order.seller_profile?.display_name || order.seller_profile?.username || 'Necunoscut';
    if (!acc[sellerId]) {
      acc[sellerId] = { name: sellerName, totalSales: 0, totalAmount: 0, orders: [] };
    }
    acc[sellerId].totalSales += 1;
    acc[sellerId].totalAmount += Number(order.amount || 0);
    acc[sellerId].orders.push(order);
    return acc;
  }, {} as Record<string, { name: string; totalSales: number; totalAmount: number; orders: any[] }>) || {};

  const sellerSalesArray = Object.entries(sellerSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalSales - a.totalSales);

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.listings?.title?.toLowerCase().includes(search.toLowerCase()) ||
      order.id?.toLowerCase().includes(search.toLowerCase()) ||
      order.buyer_profile?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.seller_profile?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.buyer_profile?.short_id?.toLowerCase().includes(search.toLowerCase()) ||
      order.seller_profile?.short_id?.toLowerCase().includes(search.toLowerCase()) ||
      order.tracking_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNotifySeller = async (sellerId: string, sellerName: string) => {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: sellerId,
        type: 'tracking_reminder',
        title: 'Adaugă numărul de urmărire (AWB)',
        message: 'Ai comenzi care nu au încă număr de urmărire. Te rugăm să adaugi AWB-ul cât mai curând pentru a evita întârzierile.',
      });
      if (error) throw error;
      toast({ title: `Notificare trimisă către ${sellerName}` });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  const handleNotifyAllMissing = async () => {
    const sellerIds = [...new Set(missingTracking.map(o => o.seller_id))];
    let sent = 0;
    for (const sellerId of sellerIds) {
      try {
        await supabase.from('notifications').insert({
          user_id: sellerId,
          type: 'tracking_reminder',
          title: 'Adaugă numărul de urmărire (AWB)',
          message: 'Ai comenzi care nu au încă număr de urmărire. Te rugăm să adaugi AWB-ul cât mai curând.',
        });
        sent++;
      } catch {}
    }
    toast({ title: `${sent} notificări trimise către vânzători fără AWB` });
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setIsUpdating(orderId);
    try {
      // Use the admin RPC function for secure status update
      const { data, error } = await supabase.rpc('admin_update_order_status', {
        p_order_id: orderId,
        p_status: status,
      });

      if (error) throw error;

      // Also update delivery_confirmed_at if delivered
      if (status === 'delivered') {
        await supabase.from('orders').update({ delivery_confirmed_at: new Date().toISOString() }).eq('id', orderId);
      }

      // Notify buyer and seller
      const order = orders?.find(o => o.id === orderId);
      if (order) {
        const statusLabels: Record<string, string> = {
          paid: 'plătită', shipped: 'expediată', delivered: 'livrată',
          cancelled: 'anulată', refunded: 'rambursată',
        };
        const label = statusLabels[status] || status;
        const title = order.listings?.title || 'Comandă';

        await Promise.all([
          supabase.from('notifications').insert({
            user_id: order.buyer_id,
            type: 'order_update',
            title: `Comandă ${label}`,
            message: `Comanda ta pentru "${title}" a fost marcată ca ${label} de către admin.`,
            data: { orderId },
          }),
          supabase.from('notifications').insert({
            user_id: order.seller_id,
            type: 'order_update',
            title: `Comandă ${label}`,
            message: `Comanda pentru "${title}" a fost marcată ca ${label} de către admin.`,
            data: { orderId },
          }),
        ]);

        // Send email for important status changes
        if (['shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
          try {
            await supabase.functions.invoke('send-notification', {
              body: {
                userId: order.buyer_id,
                type: 'email',
                subject: `Comandă ${label} - ${title}`,
                message: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
                    <h2>Comanda ta a fost ${label}</h2>
                    <p>Produsul <strong>"${title}"</strong> - comanda a fost marcată ca <strong>${label}</strong>.</p>
                    <a href="https://www.marketplaceromania.com/orders" style="display:inline-block;background:#FF6B35;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;margin-top:16px;">Vezi Comenzile</a>
                  </div>`,
              },
            });
          } catch (emailErr) {
            console.error('Status email failed (non-blocking):', emailErr);
          }

          if (status === 'shipped' && order.tracking_number) {
            try {
              await supabase.functions.invoke('send-tracking-email', {
                body: { order_id: orderId, tracking_number: order.tracking_number, carrier: order.carrier || 'other' },
              });
            } catch (trackErr) {
              console.error('Tracking email failed (non-blocking):', trackErr);
            }
          }
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: `Status comandă actualizat: ${status}` });
    } catch (error: any) {
      toast({ title: 'Eroare la actualizare status', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleOpenAwbDialog = (order: any) => {
    setAwbDialog({
      open: true,
      orderId: order.id,
      currentAwb: order.tracking_number || '',
      currentCarrier: order.carrier || 'fan_courier',
    });
    setAwbInput(order.tracking_number || '');
    setCarrierInput(order.carrier || 'fan_courier');
  };

  const handleSaveAwb = async () => {
    if (!awbInput.trim()) {
      toast({ title: 'Introdu un număr AWB valid', variant: 'destructive' });
      return;
    }
    setIsUpdating(awbDialog.orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: awbInput.trim(),
          carrier: carrierInput,
          updated_at: new Date().toISOString(),
        })
        .eq('id', awbDialog.orderId);

      if (error) throw error;

      // Notify buyer about tracking
      const order = orders?.find(o => o.id === awbDialog.orderId);
      if (order) {
        const title = order.listings?.title || 'Comandă';
        await supabase.from('notifications').insert({
          user_id: order.buyer_id,
          type: 'tracking_update',
          title: '📦 AWB adăugat de admin',
          message: `Numărul de urmărire pentru "${title}" este: ${awbInput.trim()}`,
          data: { orderId: awbDialog.orderId, tracking_number: awbInput.trim(), carrier: carrierInput },
        });

        // Send tracking email
        try {
          await supabase.functions.invoke('send-tracking-email', {
            body: { order_id: awbDialog.orderId, tracking_number: awbInput.trim(), carrier: carrierInput },
          });
        } catch {}
      }

      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'AWB salvat cu succes!' });
      setAwbDialog({ open: false, orderId: '', currentAwb: '', currentCarrier: 'fan_courier' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveAwb = async () => {
    setIsUpdating(awbDialog.orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_number: null, carrier: null, updated_at: new Date().toISOString() })
        .eq('id', awbDialog.orderId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'AWB șters' });
      setAwbDialog({ open: false, orderId: '', currentAwb: '', currentCarrier: 'fan_courier' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'payment_pending': return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Plată în Așteptare</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">În Așteptare</Badge>;
      case 'paid': return <Badge className="bg-green-500">Plătit</Badge>;
      case 'shipped': return <Badge className="bg-blue-500">Expediat</Badge>;
      case 'delivered': return <Badge className="bg-purple-500">Livrat</Badge>;
      case 'cancelled': return <Badge variant="destructive">Anulat</Badge>;
      case 'refunded': return <Badge variant="outline">Rambursat</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderImage = (order: any) => {
    const primaryImage = order.listings?.listing_images?.find((img: any) => img.is_primary)?.image_url;
    return primaryImage || order.listings?.listing_images?.[0]?.image_url;
  };

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending' || o.status === 'payment_pending').length || 0,
    paid: orders?.filter(o => o.status === 'paid').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    missingTracking: missingTracking.length,
  };

  const renderOrderRow = (order: any) => {
    const orderImage = getOrderImage(order);
    const isCurrentlyUpdating = isUpdating === order.id;
    return (
      <TableRow key={order.id} className={isCurrentlyUpdating ? 'opacity-50' : ''}>
        <TableCell>
          <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
            {orderImage ? (
              <img src={orderImage} alt={order.listings?.title || 'Produs'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <p className="font-medium truncate max-w-[150px]">{order.listings?.title || 'Produs Șters'}</p>
          <p className="text-xs text-muted-foreground font-mono">{order.id.slice(0, 8)}...</p>
        </TableCell>
        <TableCell className="text-sm">
          <div>
            <p>{order.buyer_profile?.display_name || 'Cumpărător'}</p>
            {order.buyer_profile?.short_id && (
              <code className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold">#{order.buyer_profile.short_id}</code>
            )}
          </div>
        </TableCell>
        <TableCell className="text-sm">
          <div>
            <p>{order.seller_profile?.display_name || 'Vânzător'}</p>
            {order.seller_profile?.short_id && (
              <code className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold">#{order.seller_profile.short_id}</code>
            )}
          </div>
        </TableCell>
        <TableCell className="font-medium">{formatPriceWithRON(Number(order.amount))}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {order.tracking_number ? (
              <Badge variant="outline" className="text-xs font-mono cursor-pointer hover:bg-muted" onClick={() => handleOpenAwbDialog(order)}>
                {order.tracking_number}
              </Badge>
            ) : (
              <Button variant="outline" size="sm" className="text-[10px] h-6 gap-1 border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleOpenAwbDialog(order)}>
                <Edit3 className="h-3 w-3" /> Adaugă AWB
              </Button>
            )}
          </div>
        </TableCell>
        <TableCell>{getStatusBadge(order.status)}</TableCell>
        <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString('ro-RO')}</TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            {/* Quick action buttons */}
            {order.status === 'pending' && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-green-600 border-green-300" 
                onClick={() => handleUpdateStatus(order.id, 'paid')} disabled={isCurrentlyUpdating}>
                <CheckCircle className="h-3 w-3" /> Aprobă
              </Button>
            )}
            {(order.status === 'pending' || order.status === 'payment_pending') && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-300" 
                onClick={() => handleUpdateStatus(order.id, 'cancelled')} disabled={isCurrentlyUpdating}>
                <XCircle className="h-3 w-3" /> Anulează
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isCurrentlyUpdating}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actualizează Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'paid')} disabled={order.status === 'paid'}>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Marchează Plătit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'shipped')} disabled={order.status === 'shipped'}>
                  <Truck className="h-4 w-4 mr-2 text-blue-500" /> Marchează Expediat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'delivered')} disabled={order.status === 'delivered'}>
                  <Package className="h-4 w-4 mr-2 text-purple-500" /> Marchează Livrat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOpenAwbDialog(order)}>
                  <Edit3 className="h-4 w-4 mr-2 text-orange-500" /> {order.tracking_number ? 'Editează AWB' : 'Adaugă AWB'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'cancelled')} disabled={order.status === 'cancelled'} className="text-red-600">
                  <XCircle className="h-4 w-4 mr-2" /> Anulează Comanda
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'refunded')} disabled={order.status === 'refunded'} className="text-red-600">
                  <RefreshCw className="h-4 w-4 mr-2" /> Marchează Rambursat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-4 w-full min-w-0 overflow-hidden">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Gestionare Comenzi & AWB</h1>
          <p className="text-sm text-muted-foreground">Vizualizează, gestionează statusuri și numere de urmărire (AWB)</p>
        </div>


        {/* Stats */}
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="p-0">
            <CardContent className="p-3">
              <div className="text-lg sm:text-xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Comenzi</p>
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
          <Card className="p-0 border-red-200 bg-red-50/50">
            <CardContent className="p-3">
              <div className="text-lg sm:text-xl font-bold text-red-600">{stats.missingTracking}</div>
              <p className="text-xs text-red-600">Fără AWB</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-auto p-0.5">
            <TabsTrigger value="all" className="text-xs py-2 gap-1">
              <Package className="h-3 w-3" /> Toate Comenzile
            </TabsTrigger>
            <TabsTrigger value="missing" className="text-xs py-2 gap-1">
              <AlertTriangle className="h-3 w-3" /> Fără AWB ({stats.missingTracking})
            </TabsTrigger>
            <TabsTrigger value="sellers" className="text-xs py-2 gap-1">
              <Truck className="h-3 w-3" /> Vânzări / Vânzător
            </TabsTrigger>
          </TabsList>

          {/* All Orders Tab */}
          <TabsContent value="all">
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
                      <Input placeholder="Caută comenzi, AWB..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-sm" />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[160px] text-xs"><SelectValue /></SelectTrigger>
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
                  <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">Poza</TableHead>
                          <TableHead>Produs</TableHead>
                          <TableHead>Cumpărător</TableHead>
                          <TableHead>Vânzător</TableHead>
                          <TableHead>Sumă</TableHead>
                          <TableHead>AWB</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{filteredOrders.map(renderOrderRow)}</TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">Nu s-au găsit comenzi</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missing Tracking Tab */}
          <TabsContent value="missing">
            <Card className="overflow-hidden border-red-200">
              <CardHeader className="p-3 bg-red-50/50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Comenzi Fără Număr de Urmărire (AWB)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Vânzători care au vândut dar nu au adăugat încă numărul de tracking
                    </CardDescription>
                  </div>
                  {missingTracking.length > 0 && (
                    <Button size="sm" variant="destructive" onClick={handleNotifyAllMissing} className="gap-1.5">
                      <Bell className="h-3.5 w-3.5" /> Notifică Toți ({[...new Set(missingTracking.map(o => o.seller_id))].length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-2">
                {missingTracking.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">Poza</TableHead>
                          <TableHead>Produs</TableHead>
                          <TableHead>Cumpărător</TableHead>
                          <TableHead>Vânzător</TableHead>
                          <TableHead>Sumă</TableHead>
                          <TableHead>AWB</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{missingTracking.map(renderOrderRow)}</TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>Toate comenzile au număr de urmărire!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales by Seller Tab */}
          <TabsContent value="sellers">
            <Card className="overflow-hidden">
              <CardHeader className="p-3">
                <CardTitle className="text-base">Vânzări per Vânzător</CardTitle>
                <CardDescription className="text-xs">{sellerSalesArray.length} vânzători cu comenzi</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-2">
                {sellerSalesArray.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Vânzător</TableHead>
                          <TableHead>Nr. Comenzi</TableHead>
                          <TableHead>Total Vânzări</TableHead>
                          <TableHead>Fără AWB</TableHead>
                          <TableHead className="text-right">Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sellerSalesArray.map((seller, idx) => {
                          const noTracking = seller.orders.filter(o => 
                            ['paid', 'pending'].includes(o.status) && !o.tracking_number
                          ).length;
                          return (
                            <TableRow key={seller.id}>
                              <TableCell className="font-bold text-muted-foreground">{idx + 1}</TableCell>
                              <TableCell className="font-medium">{seller.name}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{seller.totalSales}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">{formatPriceWithRON(seller.totalAmount)}</TableCell>
                              <TableCell>
                                {noTracking > 0 ? (
                                  <Badge variant="destructive" className="text-xs">{noTracking} lipsă</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-green-600 border-green-300 text-xs">✓ OK</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {noTracking > 0 && (
                                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleNotifySeller(seller.id, seller.name)}>
                                    <Bell className="h-3 w-3" /> Notifică
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">Nicio vânzare înregistrată</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AWB Dialog */}
      <Dialog open={awbDialog.open} onOpenChange={(open) => !open && setAwbDialog({ open: false, orderId: '', currentAwb: '', currentCarrier: 'fan_courier' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              {awbDialog.currentAwb ? 'Editează AWB' : 'Adaugă AWB'}
            </DialogTitle>
            <DialogDescription>
              Introdu numărul de urmărire (AWB) și selectează curierul.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Curier</label>
              <Select value={carrierInput} onValueChange={setCarrierInput}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARRIERS.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Număr AWB</label>
              <Input
                placeholder="Ex: RO123456789"
                value={awbInput}
                onChange={(e) => setAwbInput(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {awbDialog.currentAwb && (
              <Button variant="outline" className="text-red-600 border-red-300" onClick={handleRemoveAwb} disabled={!!isUpdating}>
                <XCircle className="h-4 w-4 mr-1" /> Șterge AWB
              </Button>
            )}
            <Button onClick={handleSaveAwb} disabled={!!isUpdating || !awbInput.trim()} className="gap-1">
              <CheckCircle className="h-4 w-4" /> Salvează AWB
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
