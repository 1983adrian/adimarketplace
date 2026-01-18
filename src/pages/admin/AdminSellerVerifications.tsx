import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle, XCircle, Clock, Eye, FileText, User, 
  Calendar, ExternalLink, Search, Filter, Loader2 
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface VerificationRequest {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  verified_at: string | null;
  verification_documents: any[];
  created_at: string;
  store_name: string | null;
}

const AdminSellerVerifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Fetch all users with verification documents
  const { data: verificationRequests, isLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('verification_documents', 'eq', '[]')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VerificationRequest[];
    },
  });

  // Approve verification
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'verification_approved',
        title: 'Verificare Aprobată ✅',
        message: 'Contul tău de vânzător a fost verificat cu succes! Acum ai bifa albastră.',
      });

      // Get user profile for SMS notification
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, paypal_email')
        .eq('user_id', userId)
        .single();

      // Send SMS notification
      if (profile?.phone) {
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'sms',
              to: profile.phone,
              message: '✅ Felicitări! Contul tău AdiMarket a fost verificat. Acum ai bifa albastră pe profil!',
            },
          });
        } catch (smsError) {
          console.log('SMS notification failed:', smsError);
        }
      }

      // Send email notification
      if (profile?.paypal_email) {
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'email',
              to: profile.paypal_email,
              subject: '✅ Contul tău a fost verificat!',
              message: `
                <h1>🎉 Felicitări!</h1>
                <p>Contul tău de vânzător pe AdiMarket a fost verificat cu succes.</p>
                <p>Acum ai bifa albastră pe profil, ceea ce înseamnă că cumpărătorii vor avea mai multă încredere în tine.</p>
                <p>Poți continua să vinzi pe platformă.</p>
              `,
            },
          });
        } catch (emailError) {
          console.log('Email notification failed:', emailError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      toast({
        title: 'Verificare Aprobată',
        description: 'Vânzătorul a fost verificat cu succes.',
      });
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reject verification
  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_verified: false,
          verification_documents: [],
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'verification_rejected',
        title: 'Verificare Respinsă',
        message: `Cererea ta de verificare a fost respinsă. Motiv: ${reason}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      toast({
        title: 'Verificare Respinsă',
        description: 'Cererea de verificare a fost respinsă.',
      });
      setSelectedUser(null);
      setShowRejectDialog(false);
      setRejectionReason('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const pendingRequests = verificationRequests?.filter(r => !r.is_verified && r.verification_documents.length > 0) || [];
  const verifiedUsers = verificationRequests?.filter(r => r.is_verified) || [];

  const filteredPending = pendingRequests.filter(r =>
    r.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.store_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVerified = verifiedUsers.filter(r =>
    r.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.store_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verificări Vânzători</h1>
          <p className="text-muted-foreground">
            Gestionează cererile de verificare ale vânzătorilor
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">În Așteptare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-amber-500" />
                <span className="text-3xl font-bold">{pendingRequests.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verificați</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="text-3xl font-bold">{verifiedUsers.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cereri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold">{verificationRequests?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după nume, username sau magazin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              În Așteptare ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Verificați ({verifiedUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredPending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nu există cereri de verificare în așteptare.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilizator</TableHead>
                      <TableHead>Magazin</TableHead>
                      <TableHead>Documente</TableHead>
                      <TableHead>Data Cererii</TableHead>
                      <TableHead className="text-right">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPending.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={request.avatar_url || undefined} />
                              <AvatarFallback>
                                {request.display_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.display_name || 'Fără nume'}</p>
                              <p className="text-sm text-muted-foreground">@{request.username || 'user'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{request.store_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {request.verification_documents.length} fișiere
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Revizuiește
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verified">
            {filteredVerified.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nu există vânzători verificați.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilizator</TableHead>
                      <TableHead>Magazin</TableHead>
                      <TableHead>Data Verificării</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVerified.map((user) => (
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
                              <p className="text-sm text-muted-foreground">@{user.username || 'user'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.store_name || '-'}</TableCell>
                        <TableCell>
                          {user.verified_at ? format(new Date(user.verified_at), 'dd MMM yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificat
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Revizuire Cerere Verificare</DialogTitle>
              <DialogDescription>
                Verifică documentele încărcate de vânzător
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar_url || undefined} />
                    <AvatarFallback className="text-xl">
                      {selectedUser.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedUser.display_name || 'Fără nume'}</h3>
                    <p className="text-muted-foreground">@{selectedUser.username || 'user'}</p>
                    {selectedUser.store_name && (
                      <Badge variant="outline" className="mt-1">
                        {selectedUser.store_name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-medium mb-3">Documente Încărcate:</h4>
                  <div className="grid gap-3">
                    {selectedUser.verification_documents.map((doc: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(doc.uploadedAt), 'dd MMM yyyy, HH:mm')}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Deschide
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                    className="text-destructive"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Respinge
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate(selectedUser.user_id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Aprobă Verificarea
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Respinge Verificarea</DialogTitle>
              <DialogDescription>
                Specifică motivul respingerii cererii de verificare
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Motivul respingerii..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Anulează
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedUser && rejectionReason) {
                    rejectMutation.mutate({
                      userId: selectedUser.user_id,
                      reason: rejectionReason,
                    });
                  }
                }}
                disabled={!rejectionReason || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                Respinge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSellerVerifications;
