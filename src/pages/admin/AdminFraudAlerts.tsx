import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  AlertTriangle, Shield, Ban, DollarSign, Users, Gavel, 
  Eye, CheckCircle, XCircle, Clock, User, AlertCircle,
  Lock, Unlock, Pause, Play, FileWarning
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface FraudAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  evidence: any[];
  listing_id: string | null;
  related_user_ids: string[];
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  auto_action_taken: string | null;
  created_at: string;
}

interface SellerProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  store_name: string | null;
  is_suspended: boolean;
  suspension_reason: string | null;
  withdrawal_blocked: boolean;
  withdrawal_blocked_reason: string | null;
  fraud_score: number;
  payout_balance: number;
  pending_balance: number;
}

export default function AdminFraudAlerts() {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showBlockWithdrawalDialog, setShowBlockWithdrawalDialog] = useState(false);

  // Fetch fraud alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['fraud-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FraudAlert[];
    }
  });

  // Fetch flagged sellers (with fraud score > 0 or suspended)
  const { data: flaggedSellers, isLoading: sellersLoading } = useQuery({
    queryKey: ['flagged-sellers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, store_name, is_suspended, suspension_reason, withdrawal_blocked, withdrawal_blocked_reason, fraud_score, payout_balance, pending_balance')
        .or('fraud_score.gt.0,is_suspended.eq.true,withdrawal_blocked.eq.true')
        .order('fraud_score', { ascending: false });
      if (error) throw error;
      return data as SellerProfile[];
    }
  });

  // Update alert status
  const updateAlertMutation = useMutation({
    mutationFn: async ({ alertId, status, notes }: { alertId: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('fraud_alerts')
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
      toast.success('Alertă actualizată');
      setSelectedAlert(null);
    }
  });

  // Suspend seller
  const suspendSellerMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspended_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-sellers'] });
      toast.success('Vânzător suspendat');
      setShowSuspendDialog(false);
      setSelectedSeller(null);
    }
  });

  // Unsuspend seller
  const unsuspendSellerMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null
        })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-sellers'] });
      toast.success('Suspendare ridicată');
    }
  });

  // Block withdrawal
  const blockWithdrawalMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          withdrawal_blocked: true,
          withdrawal_blocked_reason: reason,
          withdrawal_blocked_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-sellers'] });
      toast.success('Extragere blocată');
      setShowBlockWithdrawalDialog(false);
      setSelectedSeller(null);
    }
  });

  // Unblock withdrawal
  const unblockWithdrawalMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          withdrawal_blocked: false,
          withdrawal_blocked_reason: null,
          withdrawal_blocked_at: null
        })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-sellers'] });
      toast.success('Extragere deblocată');
    }
  });

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'shill_bidding': return <Gavel className="h-4 w-4 text-destructive" />;
      case 'price_manipulation': return <DollarSign className="h-4 w-4 text-orange-500" />;
      case 'suspicious_withdrawal': return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case 'multiple_accounts': return <Users className="h-4 w-4 text-destructive" />;
      case 'suspicious_bidding_pattern': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'shill_bidding': return 'Licitație pe Propriul Produs';
      case 'price_manipulation': return 'Manipulare Preț';
      case 'suspicious_withdrawal': return 'Extragere Suspicioasă';
      case 'multiple_accounts': return 'Conturi Multiple';
      case 'suspicious_bidding_pattern': return 'Pattern Suspicios';
      default: return type;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critic</Badge>;
      case 'warning': return <Badge className="bg-orange-500">Avertisment</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Clock className="h-3 w-3 mr-1" />În așteptare</Badge>;
      case 'reviewed': return <Badge variant="outline" className="border-blue-500 text-blue-600"><Eye className="h-3 w-3 mr-1" />Revizuit</Badge>;
      case 'confirmed_fraud': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Fraudă Confirmată</Badge>;
      case 'false_positive': return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Fals Pozitiv</Badge>;
      case 'resolved': return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Rezolvat</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingAlerts = alerts?.filter(a => a.status === 'pending') || [];
  const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && a.status === 'pending') || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-destructive" />
              Detectare Fraudă AI
            </h1>
            <p className="text-muted-foreground">
              Monitorizare automată a activităților frauduloase și gestionare vânzători
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-destructive/50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{criticalAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Alerte Critice</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingAlerts.length}</p>
                <p className="text-sm text-muted-foreground">În Așteptare</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Ban className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{flaggedSellers?.filter(s => s.is_suspended).length || 0}</p>
                <p className="text-sm text-muted-foreground">Conturi Suspendate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Lock className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{flaggedSellers?.filter(s => s.withdrawal_blocked).length || 0}</p>
                <p className="text-sm text-muted-foreground">Extrageri Blocate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerte Fraudă
              {pendingAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingAlerts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sellers" className="gap-2">
              <User className="h-4 w-4" />
              Control Vânzători
            </TabsTrigger>
          </TabsList>

          {/* Fraud Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {alertsLoading ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă...</CardContent></Card>
            ) : !alerts || alerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium">Nicio alertă de fraudă</p>
                  <p className="text-muted-foreground">AI-ul monitorizează activ pentru activități suspecte</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={alert.severity === 'critical' && alert.status === 'pending' ? 'border-destructive' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertTypeIcon(alert.alert_type)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{alert.title}</h3>
                              {getSeverityBadge(alert.severity)}
                              {getStatusBadge(alert.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{getAlertTypeLabel(alert.alert_type)}</span>
                              <span>{format(new Date(alert.created_at), 'dd MMM yyyy HH:mm', { locale: ro })}</span>
                              {alert.auto_action_taken && (
                                <Badge variant="outline" className="text-xs">
                                  Acțiune auto: {alert.auto_action_taken}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setAdminNotes(alert.admin_notes || '');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Revizuiește
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Seller Control Tab */}
          <TabsContent value="sellers" className="space-y-4">
            {sellersLoading ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Se încarcă...</CardContent></Card>
            ) : !flaggedSellers || flaggedSellers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium">Niciun vânzător marcat</p>
                  <p className="text-muted-foreground">Toți vânzătorii au activitate normală</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {flaggedSellers.map((seller) => (
                  <Card key={seller.user_id} className={seller.is_suspended ? 'border-destructive' : seller.withdrawal_blocked ? 'border-orange-500' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${seller.is_suspended ? 'bg-destructive/10' : seller.withdrawal_blocked ? 'bg-orange-500/10' : 'bg-muted'}`}>
                            <User className={`h-5 w-5 ${seller.is_suspended ? 'text-destructive' : seller.withdrawal_blocked ? 'text-orange-500' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="font-medium">{seller.display_name || seller.username || 'Anonim'}</p>
                            <p className="text-sm text-muted-foreground">{seller.store_name || 'Fără magazin'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">Scor fraudă: {seller.fraud_score}</Badge>
                              {seller.is_suspended && <Badge variant="destructive">Suspendat</Badge>}
                              {seller.withdrawal_blocked && <Badge className="bg-orange-500">Extragere Blocată</Badge>}
                            </div>
                            {(seller.suspension_reason || seller.withdrawal_blocked_reason) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Motiv: {seller.suspension_reason || seller.withdrawal_blocked_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <p className="text-sm">Sold: <span className="font-medium">£{(seller.payout_balance || 0).toFixed(2)}</span></p>
                            <p className="text-xs text-muted-foreground">În așteptare: £{(seller.pending_balance || 0).toFixed(2)}</p>
                          </div>
                          {seller.is_suspended ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => unsuspendSellerMutation.mutate(seller.user_id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Reactivează
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-orange-500 text-orange-600"
                              onClick={() => {
                                setSelectedSeller(seller);
                                setShowSuspendDialog(true);
                              }}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Suspendă
                            </Button>
                          )}
                          {seller.withdrawal_blocked ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => unblockWithdrawalMutation.mutate(seller.user_id)}
                            >
                              <Unlock className="h-4 w-4 mr-1" />
                              Deblochează
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-destructive text-destructive"
                              onClick={() => {
                                setSelectedSeller(seller);
                                setShowBlockWithdrawalDialog(true);
                              }}
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Blochează Extragere
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Alert Review Dialog */}
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAlert && getAlertTypeIcon(selectedAlert.alert_type)}
                Revizuire Alertă
              </DialogTitle>
            </DialogHeader>
            {selectedAlert && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">{selectedAlert.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
                </div>
                
                {selectedAlert.evidence && selectedAlert.evidence.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Dovezi:</h4>
                    <div className="bg-muted p-3 rounded-lg text-xs font-mono overflow-auto max-h-40">
                      {JSON.stringify(selectedAlert.evidence, null, 2)}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Note Admin:</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adaugă note despre investigație..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Schimbă Status:</label>
                  <Select
                    onValueChange={(value) => {
                      updateAlertMutation.mutate({
                        alertId: selectedAlert.id,
                        status: value,
                        notes: adminNotes
                      });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selectează status nou" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reviewed">Revizuit</SelectItem>
                      <SelectItem value="confirmed_fraud">Fraudă Confirmată</SelectItem>
                      <SelectItem value="false_positive">Fals Pozitiv</SelectItem>
                      <SelectItem value="resolved">Rezolvat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Suspend Seller Dialog */}
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <Pause className="h-5 w-5" />
                Suspendă Vânzător
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Contul vânzătorului va fi pus pe pauză. Nu va putea lista produse sau procesa comenzi.
              </p>
              <div>
                <label className="text-sm font-medium">Motiv suspendare:</label>
                <Textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Introdu motivul suspendării..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
                Anulează
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => selectedSeller && suspendSellerMutation.mutate({
                  userId: selectedSeller.user_id,
                  reason: suspensionReason
                })}
                disabled={!suspensionReason.trim()}
              >
                Suspendă
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Block Withdrawal Dialog */}
        <Dialog open={showBlockWithdrawalDialog} onOpenChange={setShowBlockWithdrawalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Lock className="h-5 w-5" />
                Blochează Extragere Bani
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vânzătorul nu va putea retrage banii din cont până la deblocare.
              </p>
              <div>
                <label className="text-sm font-medium">Motiv blocare:</label>
                <Textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Introdu motivul blocării..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockWithdrawalDialog(false)}>
                Anulează
              </Button>
              <Button 
                variant="destructive"
                onClick={() => selectedSeller && blockWithdrawalMutation.mutate({
                  userId: selectedSeller.user_id,
                  reason: suspensionReason
                })}
                disabled={!suspensionReason.trim()}
              >
                Blochează
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
