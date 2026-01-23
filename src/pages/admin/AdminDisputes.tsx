import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Dispute {
  id: string;
  order_id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-4 w-4" />, label: 'Pending' },
  investigating: { color: 'bg-blue-100 text-blue-700', icon: <AlertTriangle className="h-4 w-4" />, label: 'Investigating' },
  resolved: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-4 w-4" />, label: 'Resolved' },
  dismissed: { color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-4 w-4" />, label: 'Dismissed' },
};

export default function AdminDisputes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: disputes, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Dispute[];
    },
  });

  const updateDispute = useMutation({
    mutationFn: async ({ id, status, resolution, admin_notes }: { id: string; status: string; resolution?: string; admin_notes?: string }) => {
      const { error } = await supabase
        .from('disputes')
        .update({ status, resolution, admin_notes, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      toast({ title: 'Dispute updated successfully' });
      setSelectedDispute(null);
      setResolution('');
      setAdminNotes('');
    },
    onError: (error) => {
      toast({ title: 'Error updating dispute', description: error.message, variant: 'destructive' });
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'resolved' || newStatus === 'dismissed') {
      const dispute = disputes?.find(d => d.id === id);
      if (dispute) {
        setSelectedDispute(dispute);
        return;
      }
    }
    updateDispute.mutate({ id, status: newStatus });
  };

  const handleResolve = () => {
    if (!selectedDispute) return;
    updateDispute.mutate({
      id: selectedDispute.id,
      status: 'resolved',
      resolution,
      admin_notes: adminNotes,
    });
  };

  const pendingCount = disputes?.filter(d => d.status === 'pending').length || 0;
  const investigatingCount = disputes?.filter(d => d.status === 'investigating').length || 0;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Gestionare Dispute</h1>
          <p className="text-xs text-muted-foreground">Rezolvă conflictele cumpărător-vânzător</p>
        </div>

        {/* Stats */}
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-3">
              <div className="text-xl font-bold">{disputes?.length || 0}</div>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-yellow-700">{pendingCount}</div>
              <p className="text-[10px] text-muted-foreground">În așteptare</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-blue-700">{investigatingCount}</div>
              <p className="text-[10px] text-muted-foreground">Investigare</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xl font-bold text-green-600">
                {disputes?.filter(d => d.status === 'resolved').length || 0}
              </div>
              <p className="text-[10px] text-muted-foreground">Rezolvate</p>
            </CardContent>
          </Card>
        </div>

        {/* Disputes List */}
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Toate Disputele</CardTitle>
            <CardDescription className="text-xs">Administrează problemele raportate</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : disputes && disputes.length > 0 ? (
              <div className="space-y-2">
                {disputes.map((dispute) => {
                  const config = statusConfig[dispute.status];
                  return (
                    <div key={dispute.id} className="p-2 rounded-lg border space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <Badge className={`${config.color} text-[10px] px-1.5 py-0`}>
                              {config.icon}
                              <span className="ml-0.5">{config.label}</span>
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(dispute.created_at).toLocaleDateString('ro-RO')}
                            </span>
                          </div>
                          <p className="font-medium text-xs">{dispute.reason}</p>
                          {dispute.description && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{dispute.description}</p>
                          )}
                        </div>
                        <Select 
                          value={dispute.status} 
                          onValueChange={(value) => handleStatusChange(dispute.id, value)}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">În așteptare</SelectItem>
                            <SelectItem value="investigating">Investigare</SelectItem>
                            <SelectItem value="resolved">Rezolvat</SelectItem>
                            <SelectItem value="dismissed">Respins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex gap-3 flex-wrap">
                        <span>Comandă: <code>{dispute.order_id.slice(0, 8)}...</code></span>
                        <span>Raportor: <code>{dispute.reporter_id.slice(0, 8)}...</code></span>
                      </div>
                      {dispute.resolution && (
                        <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded text-[10px]">
                          <strong>Rezoluție:</strong> {dispute.resolution}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6 text-xs">Nicio dispută</p>
            )}
          </CardContent>
        </Card>

        {/* Resolution Dialog */}
        {selectedDispute && (
          <Card className="border-primary">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Rezolvă Disputa</CardTitle>
              <CardDescription className="text-xs">Pentru: {selectedDispute.reason}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Rezoluție</label>
                <Textarea
                  placeholder="Descrie rezoluția..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="text-xs min-h-[60px]"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Note Admin</label>
                <Textarea
                  placeholder="Note interne..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="text-xs min-h-[60px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleResolve} disabled={!resolution} size="sm" className="h-7 text-xs">
                  Rezolvă
                </Button>
                <Button variant="outline" onClick={() => setSelectedDispute(null)} size="sm" className="h-7 text-xs">
                  Anulează
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
