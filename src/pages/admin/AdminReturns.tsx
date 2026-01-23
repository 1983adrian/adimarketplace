import React, { useState } from 'react';
import { 
  Package, Search, Clock, CheckCircle, XCircle, 
  RefreshCw, MessageSquare, AlertTriangle, Eye
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateReturnStatus } from '@/hooks/useReturns';
import { format } from 'date-fns';

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-4 w-4" />, label: 'În așteptare' },
  approved: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="h-4 w-4" />, label: 'Aprobat' },
  rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" />, label: 'Respins' },
  completed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-4 w-4" />, label: 'Finalizat' },
  cancelled: { color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-4 w-4" />, label: 'Anulat' },
};

const AdminReturns = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const updateStatus = useUpdateReturnStatus();

  const { data: returns, isLoading } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns')
        .select(`
          *,
          orders (
            id,
            amount,
            listings (title, price)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredReturns = returns?.filter(r => {
    const matchesSearch = 
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: returns?.length || 0,
    pending: returns?.filter(r => r.status === 'pending').length || 0,
    approved: returns?.filter(r => r.status === 'approved').length || 0,
    completed: returns?.filter(r => r.status === 'completed').length || 0,
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedReturn) return;
    
    await updateStatus.mutateAsync({
      returnId: selectedReturn.id,
      status: status as any,
      adminNotes: adminNotes || undefined,
      refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
    });
    
    setSelectedReturn(null);
    setAdminNotes('');
    setRefundAmount('');
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Gestionare Retururi</h1>
          <p className="text-xs text-muted-foreground">Administrează cererile de retur</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-lg font-bold">{stats.pending}</p>
                  <p className="text-[10px] text-muted-foreground">Așteptare</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-lg font-bold">{stats.approved}</p>
                  <p className="text-[10px] text-muted-foreground">Aprobate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-lg font-bold">{stats.completed}</p>
                  <p className="text-[10px] text-muted-foreground">Finalizate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Caută..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="pending">Așteptare</SelectItem>
                  <SelectItem value="approved">Aprobate</SelectItem>
                  <SelectItem value="rejected">Respinse</SelectItem>
                  <SelectItem value="completed">Finalizate</SelectItem>
                  <SelectItem value="cancelled">Anulate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Returns Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Produs</TableHead>
                    <TableHead className="text-xs">Motiv</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Sumă</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Data</TableHead>
                    <TableHead className="text-right text-xs">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-3 w-16" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-3 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-3 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-3 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                        Nu există retururi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReturns.map((returnItem) => {
                      const config = statusConfig[returnItem.status] || statusConfig.pending;
                      return (
                        <TableRow key={returnItem.id}>
                          <TableCell className="font-mono text-[10px] p-2">
                            {returnItem.id.slice(0, 6)}...
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs p-2">
                            {returnItem.orders?.listings?.title?.slice(0, 20) || 'N/A'}...
                          </TableCell>
                          <TableCell className="text-xs p-2">{returnItem.reason}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs p-2">£{returnItem.orders?.amount?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell className="p-2">
                            <Badge className={`gap-0.5 ${config.color} text-[10px] px-1 py-0`}>
                              {config.icon}
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs p-2">
                            {format(new Date(returnItem.created_at), 'dd MMM')}
                          </TableCell>
                          <TableCell className="text-right p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setSelectedReturn(returnItem);
                                setAdminNotes(returnItem.admin_notes || '');
                                setRefundAmount(returnItem.refund_amount?.toString() || '');
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Return Detail Dialog */}
        <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalii Retur</DialogTitle>
              <DialogDescription>
                Gestionează cererea de retur
              </DialogDescription>
            </DialogHeader>
            
            {selectedReturn && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID Retur:</span>
                    <p className="font-mono">{selectedReturn.id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={`ml-2 ${statusConfig[selectedReturn.status]?.color}`}>
                      {statusConfig[selectedReturn.status]?.label}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Produs:</span>
                    <p className="font-medium">{selectedReturn.orders?.listings?.title}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Motiv:</span>
                    <p>{selectedReturn.reason}</p>
                  </div>
                  {selectedReturn.description && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Descriere:</span>
                      <p className="text-sm">{selectedReturn.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Sumă rambursare (£)</Label>
                    <Input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder={selectedReturn.orders?.amount?.toString()}
                    />
                  </div>
                  <div>
                    <Label>Note admin</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Notează decizia ta..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              {selectedReturn?.status === 'pending' && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={updateStatus.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Respinge
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobă
                  </Button>
                </>
              )}
              {selectedReturn?.status === 'approved' && (
                <Button
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={updateStatus.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Marchează Finalizat
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminReturns;
