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

// Fetch feedback from contact_submissions (real data, admin-visible)
const useFeedbackSubmissions = () => {
  return useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .ilike('subject', '%FEEDBACK%')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'buyers' | 'sellers'
  const { data: users, isLoading } = useAllUsers();
  const { data: feedbacks, isLoading: feedbackLoading } = useFeedbackSubmissions();
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

  const filteredUsers = users?.filter(user => {
    // Text search
    const matchesSearch = 
      user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(search.toLowerCase()) ||
      user.short_id?.toLowerCase().includes(search.toLowerCase()) ||
      user.store_name?.toLowerCase().includes(search.toLowerCase());
    
    // Role filter
    const userRole = user.user_roles?.[0]?.role || 'user';
    const matchesRole = roleFilter === 'all' || userRole === roleFilter;
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'blocked') {
      matchesStatus = user.bio?.includes('[CONT BLOCAT]');
    } else if (statusFilter === 'suspended') {
      matchesStatus = user.bio?.includes('[SUSPENDAT');
    } else if (statusFilter === 'verified') {
      matchesStatus = user.is_verified === true;
    } else if (statusFilter === 'active') {
      matchesStatus = !user.bio?.includes('[CONT BLOCAT]') && !user.bio?.includes('[SUSPENDAT');
    }
    
    // Type filter (buyers/sellers)
    let matchesType = true;
    if (typeFilter === 'sellers') {
      matchesType = user.is_seller === true;
    } else if (typeFilter === 'buyers') {
      matchesType = user.is_seller !== true;
    }
    
    return matchesSearch && matchesRole && matchesStatus && matchesType;
  });

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
    await supabase.from('contact_submissions').update({ status: 'responded', responded_at: new Date().toISOString() }).eq('id', feedbackId);
    queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
  };

  return (
    <AdminLayout>
      <div className="space-y-4 w-full max-w-full overflow-hidden">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Gestionare Utilizatori</h1>
          <p className="text-sm text-muted-foreground">Administrează utilizatori, roluri și permisiuni</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full overflow-x-auto flex-wrap h-auto p-1">
            <TabsTrigger value="users">Utilizatori</TabsTrigger>
            <TabsTrigger value="feedback" className="relative">
              Feedback
              {feedbacks && feedbacks.filter(f => f.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {feedbacks.filter(f => f.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Toți Utilizatorii</CardTitle>
                    <CardDescription className="text-xs">{filteredUsers?.length || 0} din {users?.length || 0} utilizatori</CardDescription>
                  </div>
                  
                  {/* Advanced Search & Filters */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Caută după nume, ID (ex: ABC12)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {/* Type Filter */}
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[100px] sm:w-[120px] text-xs">
                          <SelectValue placeholder="Tip" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toți</SelectItem>
                          <SelectItem value="buyers">Cumpărători</SelectItem>
                          <SelectItem value="sellers">Vânzători</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Role Filter */}
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[100px] sm:w-[120px] text-xs">
                          <SelectValue placeholder="Rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toate</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Status Filter */}
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[100px] sm:w-[120px] text-xs">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toate</SelectItem>
                          <SelectItem value="active">Activi</SelectItem>
                          <SelectItem value="verified">Verificați</SelectItem>
                          <SelectItem value="suspended">Suspendați</SelectItem>
                          <SelectItem value="blocked">Blocați</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-2 md:p-6">
                {isLoading ? (
                  <div className="space-y-4 p-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-0">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Utilizator</TableHead>
                          <TableHead className="text-xs">ID</TableHead>
                          <TableHead className="text-xs">Tip</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Rol</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Status</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Locație</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Înregistrat</TableHead>
                          <TableHead className="text-xs text-right">Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="py-2 px-2 sm:px-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {user.display_name?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{user.display_name || 'Fără nume'}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-none">
                                    @{user.username || 'utilizator'}
                                  </p>
                                  {user.store_name && (
                                    <p className="text-xs text-primary truncate max-w-[100px] sm:max-w-none">{user.store_name}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2 px-2">
                              <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-mono font-bold tracking-wider">
                                #{user.short_id || user.user_id?.slice(0, 8)}
                              </code>
                            </TableCell>
                            <TableCell className="py-2 px-2">
                              {user.is_seller ? (
                                <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1">Vânz</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] px-1">Cump</Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-2 px-2 hidden sm:table-cell">
                              {getRoleBadge(user.user_roles)}
                            </TableCell>
                            <TableCell className="py-2 px-2 hidden sm:table-cell">
                              {getStatusBadge(user)}
                            </TableCell>
                            <TableCell className="py-2 px-2 hidden md:table-cell text-xs">
                              {user.location || '-'}
                            </TableCell>
                            <TableCell className="py-2 px-2 hidden md:table-cell text-xs">
                              {new Date(user.created_at).toLocaleDateString('ro-RO')}
                            </TableCell>
                            <TableCell className="py-2 px-2 text-right">
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
                <CardDescription>Recenzii, sugestii și reclamații primite prin formularul de feedback</CardDescription>
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
                      <Card key={feedback.id} className={`${feedback.status === 'pending' ? 'border-primary bg-primary/5' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={feedback.status === 'pending' ? 'default' : 'secondary'}>
                                  {feedback.status === 'pending' ? 'Nou' : 'Citit'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(feedback.created_at).toLocaleString('ro-RO')}
                                </span>
                              </div>
                              <h4 className="font-medium">{feedback.subject}</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                                {feedback.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                👤 {feedback.name} · 📧 {feedback.email}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {feedback.status === 'pending' && (
                                <Button size="sm" variant="outline" onClick={() => markFeedbackRead(feedback.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline" asChild>
                                <a href={`mailto:${feedback.email}`}>
                                  <Mail className="h-4 w-4" />
                                </a>
                              </Button>
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
