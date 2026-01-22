import { useState } from 'react';
import { Search, MoreHorizontal, Shield, User, Ban, Check, Crown, UserX, Mail, AlertTriangle, Eye, Unlock, Lock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllUsers, useUpdateUserRole } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch feedback notifications for admin
const useFeedbackNotifications = () => {
  return useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'feedback')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const { data: users, isLoading } = useAllUsers();
  const { data: feedbacks, isLoading: feedbackLoading } = useFeedbackNotifications();
  const updateRole = useUpdateUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User action dialogs
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'suspend' | 'ban' | 'warn' | 'delete' | null;
    user: any;
  }>({ open: false, type: null, user: null });
  
  const [actionReason, setActionReason] = useState('');
  const [actionDuration, setActionDuration] = useState('7');

  const filteredUsers = users?.filter(user => 
    user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    try {
      await updateRole.mutateAsync({ userId, role });
      toast({ title: 'Rol actualizat cu succes' });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  const handleUserAction = async () => {
    if (!actionDialog.user || !actionDialog.type) return;
    
    const userId = actionDialog.user.user_id;
    
    try {
      // Create audit log entry
      await supabase.from('audit_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id || '',
        action: actionDialog.type,
        entity_type: 'user',
        entity_id: userId,
        new_values: {
          reason: actionReason,
          duration: actionDialog.type === 'suspend' ? actionDuration : null,
        },
      });

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: getActionTitle(actionDialog.type),
        message: actionReason || getDefaultActionMessage(actionDialog.type),
      });

      // Update profile status based on action
      if (actionDialog.type === 'ban' || actionDialog.type === 'suspend') {
        await supabase.from('profiles').update({
          is_verified: false,
          bio: actionDialog.type === 'ban' 
            ? `[CONT BLOCAT] ${actionReason}` 
            : `[SUSPENDAT până ${new Date(Date.now() + parseInt(actionDuration) * 24 * 60 * 60 * 1000).toLocaleDateString()}] ${actionReason}`,
        }).eq('user_id', userId);
      }

      toast({
        title: 'Acțiune aplicată',
        description: `Utilizatorul a fost ${getActionPastTense(actionDialog.type)}.`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      setActionDialog({ open: false, type: null, user: null });
      setActionReason('');
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getActionTitle = (type: string) => {
    switch (type) {
      case 'suspend': return 'Cont Suspendat Temporar';
      case 'ban': return 'Cont Blocat Permanent';
      case 'warn': return 'Avertisment Primit';
      case 'delete': return 'Cont Șters';
      default: return 'Notificare Admin';
    }
  };

  const getDefaultActionMessage = (type: string) => {
    switch (type) {
      case 'suspend': return 'Contul tău a fost suspendat temporar pentru încălcarea regulamentului.';
      case 'ban': return 'Contul tău a fost blocat permanent pentru încălcări grave ale regulamentului.';
      case 'warn': return 'Ai primit un avertisment din partea echipei. Te rugăm să respecți regulamentul platformei.';
      case 'delete': return 'Contul tău a fost șters definitiv.';
      default: return '';
    }
  };

  const getActionPastTense = (type: string) => {
    switch (type) {
      case 'suspend': return 'suspendat';
      case 'ban': return 'blocat';
      case 'warn': return 'avertizat';
      case 'delete': return 'șters';
      default: return 'procesat';
    }
  };

  const getRoleBadge = (roles: any[]) => {
    const role = roles?.[0]?.role || 'user';
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500">Moderator</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.bio?.includes('[CONT BLOCAT]')) {
      return <Badge variant="destructive">Blocat</Badge>;
    }
    if (user.bio?.includes('[SUSPENDAT')) {
      return <Badge className="bg-orange-500">Suspendat</Badge>;
    }
    if (user.is_verified) {
      return <Badge className="bg-green-500">Verificat</Badge>;
    }
    return <Badge variant="outline">Activ</Badge>;
  };

  const markFeedbackRead = async (feedbackId: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', feedbackId);
    queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestionare Utilizatori</h1>
            <p className="text-muted-foreground">Administrează utilizatori, roluri și permisiuni</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="users">Utilizatori</TabsTrigger>
            <TabsTrigger value="feedback" className="relative">
              Feedback
              {feedbacks && feedbacks.filter(f => !f.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {feedbacks.filter(f => !f.is_read).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="actions">Jurnal Acțiuni</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Toți Utilizatorii</CardTitle>
                    <CardDescription>{users?.length || 0} utilizatori înregistrați</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Caută utilizatori..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilizator</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Locație</TableHead>
                          <TableHead>Înregistrat</TableHead>
                          <TableHead className="text-right">Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {user.display_name?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.display_name || 'Fără nume'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    @{user.username || user.user_id?.slice(0, 8)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getRoleBadge(user.user_roles)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(user)}
                            </TableCell>
                            <TableCell>
                              {user.location || '-'}
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString('ro-RO')}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuLabel>Acțiuni</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  
                                  {/* View Profile */}
                                  <DropdownMenuItem onClick={() => window.open(`/seller/${user.user_id}`, '_blank')}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Vezi Profilul
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuSeparator />
                                  
                                  {/* Role Management */}
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.user_id, 'admin')}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Fă Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.user_id, 'moderator')}>
                                    <Crown className="h-4 w-4 mr-2" />
                                    Fă Moderator
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.user_id, 'user')}>
                                    <User className="h-4 w-4 mr-2" />
                                    Setează User
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuSeparator />
                                  
                                  {/* User Actions */}
                                  <DropdownMenuItem 
                                    onClick={() => setActionDialog({ open: true, type: 'warn', user })}
                                    className="text-yellow-600"
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Trimite Avertisment
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem 
                                    onClick={() => setActionDialog({ open: true, type: 'suspend', user })}
                                    className="text-orange-600"
                                  >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Suspendă Temporar
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem 
                                    onClick={() => setActionDialog({ open: true, type: 'ban', user })}
                                    className="text-destructive"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Blochează Permanent
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuSeparator />
                                  
                                  <DropdownMenuItem 
                                    onClick={() => setActionDialog({ open: true, type: 'delete', user })}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Șterge Contul
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback de la Utilizatori</CardTitle>
                <CardDescription>Recenzii, sugestii și reclamații primite</CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : feedbacks?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nu există feedback nou.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks?.map((feedback) => (
                      <Card key={feedback.id} className={`${!feedback.is_read ? 'border-primary bg-primary/5' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={!feedback.is_read ? 'default' : 'secondary'}>
                                  {(feedback.data as any)?.feedback_type || 'general'}
                                </Badge>
                                {(feedback.data as any)?.rating && (
                                  <Badge variant="outline">
                                    ⭐ {(feedback.data as any).rating}/5
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(feedback.created_at).toLocaleString('ro-RO')}
                                </span>
                              </div>
                              <h4 className="font-medium">{feedback.title}</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                                {feedback.message}
                              </p>
                              {(feedback.data as any)?.user_email && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  📧 {(feedback.data as any).user_email}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!feedback.is_read && (
                                <Button size="sm" variant="outline" onClick={() => markFeedbackRead(feedback.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {(feedback.data as any)?.user_email && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`mailto:${(feedback.data as any).user_email}`}>
                                    <Mail className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Log Tab */}
          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Jurnal Acțiuni Administrative</CardTitle>
                <CardDescription>Istoric complet al acțiunilor asupra conturilor</CardDescription>
              </CardHeader>
              <CardContent>
                <AuditLogTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionDialog.type === 'warn' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                {actionDialog.type === 'suspend' && <Lock className="h-5 w-5 text-orange-500" />}
                {actionDialog.type === 'ban' && <Ban className="h-5 w-5 text-red-500" />}
                {actionDialog.type === 'delete' && <Trash2 className="h-5 w-5 text-red-500" />}
                {actionDialog.type === 'warn' && 'Trimite Avertisment'}
                {actionDialog.type === 'suspend' && 'Suspendă Contul'}
                {actionDialog.type === 'ban' && 'Blochează Contul'}
                {actionDialog.type === 'delete' && 'Șterge Contul'}
              </DialogTitle>
              <DialogDescription>
                Această acțiune va fi aplicată utilizatorului:{' '}
                <strong>{actionDialog.user?.display_name || actionDialog.user?.username}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {actionDialog.type === 'suspend' && (
                <div className="space-y-2">
                  <Label>Durata Suspendării</Label>
                  <Select value={actionDuration} onValueChange={setActionDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 zi</SelectItem>
                      <SelectItem value="3">3 zile</SelectItem>
                      <SelectItem value="7">7 zile</SelectItem>
                      <SelectItem value="14">14 zile</SelectItem>
                      <SelectItem value="30">30 zile</SelectItem>
                      <SelectItem value="90">90 zile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Motivul Acțiunii</Label>
                <Textarea
                  placeholder="Descrie motivul pentru această acțiune..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={4}
                />
              </div>

              {actionDialog.type === 'delete' && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ Atenție: Ștergerea contului este permanentă și nu poate fi anulată!
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null, user: null })}>
                Anulează
              </Button>
              <Button 
                variant={actionDialog.type === 'warn' ? 'default' : 'destructive'}
                onClick={handleUserAction}
              >
                Confirmă {getActionPastTense(actionDialog.type || '')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// Audit Log Component
function AuditLogTable() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'user')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!logs?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nu există acțiuni înregistrate.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Acțiune</TableHead>
          <TableHead>Utilizator Afectat</TableHead>
          <TableHead>Motiv</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              <Badge variant={
                log.action === 'ban' ? 'destructive' : 
                log.action === 'suspend' ? 'secondary' : 
                'outline'
              }>
                {log.action}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {log.entity_id?.slice(0, 8)}...
            </TableCell>
            <TableCell className="max-w-xs truncate">
              {(log.new_values as any)?.reason || '-'}
            </TableCell>
            <TableCell>
              {new Date(log.created_at).toLocaleString('ro-RO')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
