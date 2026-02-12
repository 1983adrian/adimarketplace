import { useState } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  ExternalLink,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllOrders } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const CARRIERS = [
  { value: 'royal_mail', label: 'Royal Mail', trackUrl: 'https://www.royalmail.com/track-your-item' },
  { value: 'dhl', label: 'DHL', trackUrl: 'https://www.dhl.com/en/express/tracking.html' },
  { value: 'ups', label: 'UPS', trackUrl: 'https://www.ups.com/track' },
  { value: 'fedex', label: 'FedEx', trackUrl: 'https://www.fedex.com/tracking' },
  { value: 'hermes', label: 'Evri (Hermes)', trackUrl: 'https://www.evri.com/track-a-parcel' },
  { value: 'dpd', label: 'DPD', trackUrl: 'https://www.dpd.co.uk/tracking' },
  { value: 'yodel', label: 'Yodel', trackUrl: 'https://www.yodel.co.uk/track' },
  { value: 'other', label: 'Other', trackUrl: '' },
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string; bgColor: string }> = {
  pending: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: <Clock className="h-4 w-4" />, label: 'În așteptare' },
  paid: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: <CheckCircle className="h-4 w-4" />, label: 'Plătit' },
  shipped: { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: <Truck className="h-4 w-4" />, label: 'Expediat' },
  delivered: { color: 'text-green-700', bgColor: 'bg-green-100', icon: <CheckCircle className="h-4 w-4" />, label: 'Livrat' },
  cancelled: { color: 'text-red-700', bgColor: 'bg-red-100', icon: <XCircle className="h-4 w-4" />, label: 'Anulat' },
  refunded: { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: <RefreshCw className="h-4 w-4" />, label: 'Rambursat' },
};

interface OrderWithDetails {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  buyer_id: string;
  seller_id: string;
  tracking_number: string | null;
  carrier: string | null;
  shipping_address: string | null;
  delivery_confirmed_at: string | null;
  payout_amount: number | null;
  payout_status: string | null;
  buyer_fee: number | null;
  seller_commission: number | null;
  listings: { title: string; price: number } | null;
}

export default function AdminDeliveryManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [adminNote, setAdminNote] = useState('');
  const { data: orders, isLoading, refetch } = useAllOrders();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payouts
  const { data: payouts } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch profiles for buyer/seller info
  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, location');
      if (error) throw error;
      return data;
    },
  });

  const getProfile = (userId: string) => profiles?.find(p => p.user_id === userId);

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.listings?.title?.toLowerCase().includes(search.toLowerCase()) ||
      order.id?.toLowerCase().includes(search.toLowerCase()) ||
      order.tracking_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchesDate = orderDate >= monthAgo;
      }
    }
    return matchesSearch && matchesStatus && matchesDate;
  }) as OrderWithDetails[] | undefined;

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const updateData: any = { 
        status: status as any, 
        updated_at: new Date().toISOString() 
      };
      
      if (status === 'delivered') {
        updateData.delivery_confirmed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Status actualizat cu succes' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddAdminTracking = async (orderId: string, trackingNumber: string, carrier: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber, 
          carrier, 
          status: 'shipped',
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Tracking adăugat și comandă marcată ca expediată' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Stats calculations
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    paid: orders?.filter(o => o.status === 'paid').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
    totalRevenue: orders?.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.amount), 0) || 0,
    pendingShipments: orders?.filter(o => o.status === 'paid').length || 0,
    avgDeliveryTime: '2-3 zile', // Would calculate from actual data
  };

  const pendingPayouts = payouts?.filter(p => p.status === 'pending') || [];
  const totalPendingPayout = pendingPayouts.reduce((sum, p) => sum + p.net_amount, 0);

  const getCarrierInfo = (carrierValue: string | null) => {
    return CARRIERS.find(c => c.value === carrierValue) || { label: carrierValue || 'N/A', trackUrl: '' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestionare Livrări</h1>
            <p className="text-muted-foreground">Urmărește și gestionează toate expediațiile și plățile</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualizează
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Comenzi</span>
              </div>
              <div className="text-3xl font-bold mt-2">{stats.total}</div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">{stats.pending} în așteptare</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-muted-foreground">Necesită Expediere</span>
              </div>
              <div className="text-3xl font-bold mt-2 text-yellow-700">{stats.pendingShipments}</div>
              <p className="text-xs text-muted-foreground mt-1">Comenzi plătite, neexpediate</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">În Tranzit</span>
              </div>
              <div className="text-3xl font-bold mt-2 text-purple-700">{stats.shipped}</div>
              <p className="text-xs text-muted-foreground mt-1">Expediate, așteptând confirmare</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Plăți Pendinte</span>
              </div>
              <div className="text-3xl font-bold mt-2 text-green-700">£{totalPendingPayout.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">{pendingPayouts.length} plăți de procesat</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Toate Comenzile</TabsTrigger>
            <TabsTrigger value="shipping">Expedieri Active</TabsTrigger>
            <TabsTrigger value="payouts">Plăți Vânzători</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Toate Comenzile</CardTitle>
                    <CardDescription>{filteredOrders?.length || 0} comenzi găsite</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Caută comenzi, tracking..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toate Statusurile</SelectItem>
                        <SelectItem value="pending">În așteptare</SelectItem>
                        <SelectItem value="paid">Plătit</SelectItem>
                        <SelectItem value="shipped">Expediat</SelectItem>
                        <SelectItem value="delivered">Livrat</SelectItem>
                        <SelectItem value="cancelled">Anulat</SelectItem>
                        <SelectItem value="refunded">Rambursat</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-36">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Perioadă" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toate</SelectItem>
                        <SelectItem value="today">Azi</SelectItem>
                        <SelectItem value="week">Ultima săptămână</SelectItem>
                        <SelectItem value="month">Ultima lună</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const status = statusConfig[order.status] || statusConfig.pending;
                      const carrier = getCarrierInfo(order.carrier);
                      const isExpanded = expandedOrders.has(order.id);
                      const buyerProfile = getProfile(order.buyer_id);
                      const sellerProfile = getProfile(order.seller_id);

                      return (
                        <Collapsible key={order.id} open={isExpanded} onOpenChange={() => toggleOrderExpanded(order.id)}>
                          <div className="border rounded-lg overflow-hidden">
                            {/* Order Header */}
                            <div className="p-4 bg-card">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon" className="shrink-0">
                                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                  </CollapsibleTrigger>
                                  
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-sm text-muted-foreground">
                                        #{order.id.slice(0, 8)}
                                      </span>
                                      <Badge className={`${status.bgColor} ${status.color} flex items-center gap-1`}>
                                        {status.icon}
                                        {status.label}
                                      </Badge>
                                      {order.tracking_number && (
                                        <Badge variant="outline" className="gap-1">
                                          <Truck className="h-3 w-3" />
                                          {carrier.label}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="font-medium truncate mt-1">{order.listings?.title || 'Articol'}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-bold">£{Number(order.amount).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                    </p>
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        Acțiuni
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuLabel>Schimbă Status</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'paid')}>
                                        <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                                        Marchează Plătit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'shipped')}>
                                        <Truck className="h-4 w-4 mr-2 text-purple-500" />
                                        Marchează Expediat
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                                        <Package className="h-4 w-4 mr-2 text-green-500" />
                                        Confirmă Livrarea
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
                                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                        Anulează
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'refunded')}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Rambursează
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            <CollapsibleContent>
                              <div className="border-t p-4 bg-muted/30 space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                  {/* Buyer Info */}
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      Cumpărător
                                    </h4>
                                    <div className="p-3 bg-card rounded-lg">
                                      <p className="font-medium">{buyerProfile?.display_name || buyerProfile?.username || 'N/A'}</p>
                                      {order.shipping_address && (
                                        <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
                                          <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                          {order.shipping_address}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Seller Info */}
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                      <Package className="h-4 w-4" />
                                      Vânzător
                                    </h4>
                                    <div className="p-3 bg-card rounded-lg">
                                       <p className="font-medium">{sellerProfile?.display_name || sellerProfile?.username || 'N/A'}</p>
                                      {sellerProfile?.location && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {sellerProfile.location}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Shipping Info */}
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                      <Truck className="h-4 w-4" />
                                      Expediere
                                    </h4>
                                    <div className="p-3 bg-card rounded-lg">
                                      {order.tracking_number ? (
                                        <>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Curier:</span>
                                            <span className="font-medium">{carrier.label}</span>
                                          </div>
                                          <div className="flex items-center justify-between mt-1">
                                            <span className="text-sm">Tracking:</span>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{order.tracking_number}</code>
                                          </div>
                                          {carrier.trackUrl && (
                                            <Button size="sm" variant="outline" className="w-full mt-2 gap-2" asChild>
                                              <a href={`${carrier.trackUrl}?${order.tracking_number}`} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-3 w-3" />
                                                Urmărește Coletul
                                              </a>
                                            </Button>
                                          )}
                                        </>
                                      ) : (
                                        <p className="text-sm text-muted-foreground">Nu există informații de expediere</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Financial Info */}
                                <div className="p-3 bg-card rounded-lg">
                                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Detalii Financiare
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Sumă:</span>
                                      <p className="font-semibold">£{Number(order.amount).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Taxă Cumpărător:</span>
                                      <p className="font-semibold">£{(order.buyer_fee || 2).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Comision:</span>
                                      <p className="font-semibold">£{(order.seller_commission || 0).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Plată Vânzător:</span>
                                      <p className="font-semibold text-green-600">
                                        £{(order.payout_amount || (Number(order.amount) * 0.85)).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Timeline */}
                                <div className="p-3 bg-card rounded-lg">
                                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Istoric
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                                      <span>Comandă plasată:</span>
                                      <span className="text-muted-foreground">
                                        {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}
                                      </span>
                                    </div>
                                    {order.tracking_number && (
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                                        <span>Expediat:</span>
                                        <span className="text-muted-foreground">
                                          {format(new Date(order.updated_at), 'dd MMM yyyy, HH:mm')}
                                        </span>
                                      </div>
                                    )}
                                    {order.delivery_confirmed_at && (
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span>Livrat:</span>
                                        <span className="text-muted-foreground">
                                          {format(new Date(order.delivery_confirmed_at), 'dd MMM yyyy, HH:mm')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Nu au fost găsite comenzi
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expedieri Active</CardTitle>
                <CardDescription>Comenzi care necesită expediere sau sunt în tranzit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders?.filter(o => o.status === 'paid' || o.status === 'shipped').map((order) => {
                    const status = statusConfig[order.status];
                    const needsShipping = order.status === 'paid';
                    return (
                      <div key={order.id} className={`p-4 rounded-lg border ${needsShipping ? 'border-yellow-300 bg-yellow-50/50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${status.bgColor} ${status.color}`}>
                                {status.icon}
                                <span className="ml-1">{status.label}</span>
                              </Badge>
                              {needsShipping && (
                                <Badge variant="destructive" className="animate-pulse">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Necesită Expediere
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium mt-1">{order.listings?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Comandat {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">£{Number(order.amount).toFixed(2)}</p>
                            {order.tracking_number ? (
                              <p className="text-sm text-muted-foreground">
                                Tracking: {order.tracking_number}
                              </p>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="mt-2"
                                onClick={() => {
                                  setSelectedOrder(order as OrderWithDetails);
                                  setDetailsOpen(true);
                                }}
                              >
                                Adaugă Tracking
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {orders?.filter(o => o.status === 'paid' || o.status === 'shipped').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nu există expedieri active
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Plăți către Vânzători</CardTitle>
                    <CardDescription>Gestionează plățile pendinte și procesate</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Pendinte</p>
                    <p className="text-2xl font-bold text-green-600">£{totalPendingPayout.toFixed(2)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {payouts && payouts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Comandă</TableHead>
                        <TableHead>Vânzător</TableHead>
                        <TableHead>Sumă Brută</TableHead>
                        <TableHead>Comision</TableHead>
                        <TableHead>Sumă Netă</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => {
                        const sellerProfile = getProfile(payout.seller_id);
                        return (
                          <TableRow key={payout.id}>
                            <TableCell className="font-mono text-sm">
                              {payout.order_id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {sellerProfile?.display_name || sellerProfile?.username || 'N/A'}
                            </TableCell>
                            <TableCell>£{payout.gross_amount.toFixed(2)}</TableCell>
                            <TableCell className="text-red-600">
                              -£{payout.seller_commission.toFixed(2)}
                            </TableCell>
                            <TableCell className="font-bold text-green-600">
                              £{payout.net_amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={payout.status === 'pending' ? 'secondary' : 'default'}>
                                {payout.status === 'pending' ? 'Pendinte' : 'Procesat'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(payout.created_at), 'dd MMM yyyy')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Nu există plăți înregistrate
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Tracking Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adaugă Informații Tracking</DialogTitle>
              <DialogDescription>
                Adaugă numărul de tracking pentru comanda #{selectedOrder?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>
            <AddTrackingForm 
              onSubmit={(tracking, carrier) => {
                if (selectedOrder) {
                  handleAddAdminTracking(selectedOrder.id, tracking, carrier);
                  setDetailsOpen(false);
                }
              }}
              onCancel={() => setDetailsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function AddTrackingForm({ onSubmit, onCancel }: { onSubmit: (tracking: string, carrier: string) => void; onCancel: () => void }) {
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('');

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Curier</Label>
        <Select value={carrier} onValueChange={setCarrier}>
          <SelectTrigger>
            <SelectValue placeholder="Selectează curierul" />
          </SelectTrigger>
          <SelectContent>
            {CARRIERS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Număr Tracking</Label>
        <Input
          placeholder="Introdu numărul de tracking"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Anulează</Button>
        <Button onClick={() => onSubmit(tracking, carrier)} disabled={!tracking || !carrier}>
          Salvează și Marchează Expediat
        </Button>
      </DialogFooter>
    </div>
  );
}
