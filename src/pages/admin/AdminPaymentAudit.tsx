import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, Search, RefreshCw, ShieldCheck, User, Store, 
  ArrowRightLeft, FileText, AlertTriangle, CheckCircle, XCircle, Clock 
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useCurrency } from '@/contexts/CurrencyContext';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  payment_pending: { label: 'Așteaptă Plata', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  pending: { label: 'Confirmată', color: 'bg-blue-500/10 text-blue-600', icon: CheckCircle },
  paid: { label: 'Plătită', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  shipped: { label: 'Expediată', color: 'bg-indigo-500/10 text-indigo-600', icon: ArrowRightLeft },
  delivered: { label: 'Livrată', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle },
  cancelled: { label: 'Anulată', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  refunded: { label: 'Rambursată', color: 'bg-orange-500/10 text-orange-600', icon: AlertTriangle },
};

export default function AdminPaymentAudit() {
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch all orders with buyer/seller profiles
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-payment-audit', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          listings (title, price, price_currency),
          buyer:profiles!orders_buyer_id_fkey1 (user_id, display_name, username, paypal_email),
          seller:profiles!orders_seller_id_fkey1 (user_id, display_name, username, store_name, paypal_email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch financial audit log
  const { data: auditLogs } = useQuery({
    queryKey: ['admin-financial-audit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Fetch payouts
  const { data: payouts } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Stats
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
  const confirmedRevenue = orders?.filter(o => !['cancelled', 'payment_pending'].includes(o.status)).reduce((sum, o) => sum + Number(o.amount), 0) || 0;
  const pendingPayments = orders?.filter(o => o.status === 'payment_pending').length || 0;
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0;

  const filteredOrders = orders?.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.id?.toLowerCase().includes(s) ||
      o.processor_transaction_id?.toLowerCase().includes(s) ||
      (o as any).buyer?.display_name?.toLowerCase().includes(s) ||
      (o as any).seller?.display_name?.toLowerCase().includes(s) ||
      (o as any).listings?.title?.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Audit Plăți
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitorizare completă: Cumpărător → PayPal → Vânzător
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizează
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Tranzacții</p>
              <p className="text-xl font-bold">{formatPrice(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Confirmate</p>
              <p className="text-xl font-bold text-green-600">{formatPrice(confirmedRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Așteaptă Plata</p>
              <p className="text-xl font-bold text-yellow-600">{pendingPayments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Anulate</p>
              <p className="text-xl font-bold text-destructive">{cancelledOrders}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută: ID comandă, tranzacție, utilizator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="payment_pending">Așteaptă Plata</SelectItem>
              <SelectItem value="pending">Confirmată</SelectItem>
              <SelectItem value="paid">Plătită</SelectItem>
              <SelectItem value="shipped">Expediată</SelectItem>
              <SelectItem value="delivered">Livrată</SelectItem>
              <SelectItem value="cancelled">Anulată</SelectItem>
              <SelectItem value="refunded">Rambursată</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Tranzacții ({filteredOrders?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <div className="divide-y">
                {filteredOrders.map((order) => {
                  const buyer = (order as any).buyer;
                  const seller = (order as any).seller;
                  const listing = (order as any).listings;
                  const cfg = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = cfg.icon;

                  return (
                    <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* Order Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cfg.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {cfg.label}
                            </Badge>
                            <span className="text-xs font-mono text-muted-foreground">
                              #{order.id.slice(0, 8)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: ro })}
                            </span>
                          </div>
                          <p className="font-medium text-sm truncate">
                            {listing?.title || 'Produs șters'}
                          </p>
                        </div>

                        {/* Buyer → Seller Flow */}
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1.5 rounded-lg">
                            <User className="h-3.5 w-3.5 text-blue-600" />
                            <span className="font-medium text-blue-700 dark:text-blue-400 truncate max-w-[120px]">
                              {buyer?.display_name || buyer?.username || 'Cumpărător'}
                            </span>
                          </div>
                          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1.5 rounded-lg">
                            <Store className="h-3.5 w-3.5 text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-400 truncate max-w-[120px]">
                              {seller?.store_name || seller?.display_name || 'Vânzător'}
                            </span>
                          </div>
                        </div>

                        {/* Amount & PayPal */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold">{formatPrice(Number(order.amount))}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ShieldCheck className="h-3 w-3" />
                              {order.payment_processor || 'PayPal'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      {order.processor_transaction_id && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>Transaction ID: <code className="bg-muted px-1 py-0.5 rounded">{order.processor_transaction_id}</code></span>
                          {order.processor_status && (
                            <Badge variant="outline" className="text-[10px] h-5">
                              {order.processor_status}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Seller PayPal Email */}
                      {seller?.paypal_email && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          <span>PayPal vânzător: <strong>{seller.paypal_email}</strong></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Nicio tranzacție găsită</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Audit Log */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Jurnal Audit Financiar (Ultimele 50)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {auditLogs && auditLogs.length > 0 ? (
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 text-sm hover:bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{log.action}</Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {log.entity_type}: {log.entity_id?.slice(0, 8)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at!), 'dd.MM.yy HH:mm')}
                      </span>
                    </div>
                    {log.amount && (
                      <p className="text-xs mt-1">Sumă: <strong>{formatPrice(Number(log.amount))}</strong></p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Niciun log de audit
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
