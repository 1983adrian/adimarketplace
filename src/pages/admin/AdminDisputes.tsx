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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Disputes Management</h1>
          <p className="text-muted-foreground">Handle buyer-seller conflicts and reports</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{disputes?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Total Disputes</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-700">{investigatingCount}</div>
              <p className="text-sm text-muted-foreground">Under Investigation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {disputes?.filter(d => d.status === 'resolved').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Disputes List */}
        <Card>
          <CardHeader>
            <CardTitle>All Disputes</CardTitle>
            <CardDescription>Review and manage reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : disputes && disputes.length > 0 ? (
              <div className="space-y-4">
                {disputes.map((dispute) => {
                  const config = statusConfig[dispute.status];
                  return (
                    <div key={dispute.id} className="p-4 rounded-lg border space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={config.color}>
                              {config.icon}
                              <span className="ml-1">{config.label}</span>
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(dispute.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-semibold">{dispute.reason}</p>
                          {dispute.description && (
                            <p className="text-sm text-muted-foreground mt-1">{dispute.description}</p>
                          )}
                        </div>
                        <Select 
                          value={dispute.status} 
                          onValueChange={(value) => handleStatusChange(dispute.id, value)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                        <div>Order ID: <code>{dispute.order_id.slice(0, 8)}...</code></div>
                        <div>Reporter: <code>{dispute.reporter_id.slice(0, 8)}...</code></div>
                      </div>
                      {dispute.resolution && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                          <strong>Resolution:</strong> {dispute.resolution}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No disputes reported</p>
            )}
          </CardContent>
        </Card>

        {/* Resolution Dialog */}
        {selectedDispute && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Resolve Dispute</CardTitle>
              <CardDescription>Provide resolution details for: {selectedDispute.reason}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Resolution</label>
                <Textarea
                  placeholder="Describe how this dispute was resolved..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Admin Notes (internal)</label>
                <Textarea
                  placeholder="Internal notes about this case..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleResolve} disabled={!resolution}>
                  Resolve Dispute
                </Button>
                <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
