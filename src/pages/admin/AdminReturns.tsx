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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestionare Retururi</h1>
          <p className="text-muted-foreground">Administrează cererile de retur</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Retururi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">În așteptare</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">Aprobate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Finalizate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută după ID sau motiv..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="pending">În așteptare</SelectItem>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Retur</TableHead>
                  <TableHead>Produs</TableHead>
                  <TableHead>Motiv</TableHead>
                  <TableHead>Sumă</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nu există retururi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReturns.map((returnItem) => {
                    const config = statusConfig[returnItem.status] || statusConfig.pending;
                    return (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-mono text-xs">
                          {returnItem.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {returnItem.orders?.listings?.title || 'N/A'}
                        </TableCell>
                        <TableCell>{returnItem.reason}</TableCell>
                        <TableCell>£{returnItem.orders?.amount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          <Badge className={`gap-1 ${config.color}`}>
                            {config.icon}
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(returnItem.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReturn(returnItem);
                              setAdminNotes(returnItem.admin_notes || '');
                              setRefundAmount(returnItem.refund_amount?.toString() || '');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
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
