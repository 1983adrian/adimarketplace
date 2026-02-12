import { useState } from 'react';
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search,
  Download,
  User,
  Building2,
  CreditCard,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SellerPayout {
  id: string;
  seller_id: string;
  order_id: string | null;
  gross_amount: number;
  platform_commission: number;
  net_amount: number;
  status: string;
  payout_method: string | null;
  processor: string | null;
  created_at: string;
  processed_at: string | null;
  completed_at: string | null;
  seller?: {
    display_name: string | null;
    store_name: string | null;
    avatar_url: string | null;
    paypal_email: string | null;
  };
}

export default function AdminSellerPayouts() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: payouts, isLoading, refetch } = useQuery({
    queryKey: ['admin-seller-payouts', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('seller_payouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: payoutsData, error } = await query;
      if (error) throw error;

      // Fetch seller profiles separately
      const sellerIds = [...new Set(payoutsData?.map(p => p.seller_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, store_name, avatar_url, paypal_email')
        .in('user_id', sellerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return payoutsData?.map(payout => ({
        ...payout,
        seller: profileMap.get(payout.seller_id) || null,
      })) as SellerPayout[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['payout-stats'],
    queryFn: async () => {
      const { data: allPayouts } = await supabase
        .from('seller_payouts')
        .select('status, net_amount');

      const stats = {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        totalAmount: 0,
        pendingAmount: 0,
      };

      allPayouts?.forEach(p => {
        stats.total++;
        stats.totalAmount += Number(p.net_amount);
        
        switch (p.status) {
          case 'pending':
            stats.pending++;
            stats.pendingAmount += Number(p.net_amount);
            break;
          case 'processing':
            stats.processing++;
            break;
          case 'completed':
            stats.completed++;
            break;
          case 'failed':
          case 'cancelled':
            stats.failed++;
            break;
        }
      });

      return stats;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="h-3 w-3" />Finalizat</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700 gap-1"><RefreshCw className="h-3 w-3 animate-spin" />În procesare</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-500 gap-1"><Clock className="h-3 w-3" />În așteptare</Badge>;
      case 'failed':
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Eșuat</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayouts = payouts?.filter(p => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      p.seller?.display_name?.toLowerCase().includes(searchLower) ||
      p.seller?.store_name?.toLowerCase().includes(searchLower) ||
      p.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent flex items-center gap-3">
              <Wallet className="h-8 w-8 text-green-600" />
              Plăți Vânzători
            </h1>
            <p className="text-muted-foreground">Gestionează și monitorizează plățile către vânzători</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualizează
            </Button>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                În Așteptare
                <Clock className="h-4 w-4 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pending || 0}</div>
              <p className="text-sm text-amber-600 font-medium">£{stats?.pendingAmount?.toFixed(2) || '0.00'}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                În Procesare
                <RefreshCw className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.processing || 0}</div>
              <p className="text-sm text-muted-foreground">Transferuri active</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Finalizate
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completed || 0}</div>
              <p className="text-sm text-green-600 font-medium">£{stats?.totalAmount?.toFixed(2) || '0.00'} total</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Eșuate
                <XCircle className="h-4 w-4 text-red-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.failed || 0}</div>
              <p className="text-sm text-muted-foreground">Necesită atenție</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută vânzător..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="pending">În așteptare</SelectItem>
                  <SelectItem value="processing">În procesare</SelectItem>
                  <SelectItem value="completed">Finalizate</SelectItem>
                  <SelectItem value="failed">Eșuate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista Plăți</CardTitle>
            <CardDescription>{filteredPayouts?.length || 0} plăți găsite</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPayouts && filteredPayouts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vânzător</TableHead>
                      <TableHead>Sumă</TableHead>
                      <TableHead>Comision</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Metodă</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.map((payout) => (
                      <TableRow key={payout.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={payout.seller?.avatar_url || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                {payout.seller?.display_name?.[0] || 'V'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{payout.seller?.store_name || payout.seller?.display_name || 'Vânzător'}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {payout.seller?.paypal_email ? 'PayPal' : 'Fără PayPal'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">£{Number(payout.gross_amount).toFixed(2)}</TableCell>
                        <TableCell className="text-red-600">-£{Number(payout.platform_commission).toFixed(2)}</TableCell>
                        <TableCell className="font-bold text-green-600">£{Number(payout.net_amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm uppercase">{payout.payout_method || 'IBAN'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status || 'pending')}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(payout.created_at).toLocaleDateString('ro-RO')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nicio plată găsită</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
