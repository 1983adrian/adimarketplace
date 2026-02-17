import { useState } from 'react';
import { Search, MessageCircle, Eye, Trash2, Ban, Unlock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllConversations } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminMessages() {
  const [search, setSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const [blockConvId, setBlockConvId] = useState<string | null>(null);
  const { data: conversations, isLoading } = useAllConversations();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredConversations = conversations?.filter(conv => 
    conv.listings?.title?.toLowerCase().includes(search.toLowerCase()) ||
    conv.id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteMessage = async () => {
    if (!deleteMessageId) return;
    try {
      const { error } = await supabase.from('messages').delete().eq('id', deleteMessageId);
      if (error) throw error;
      toast({ title: 'Mesaj șters' });
      // Update selected conversation messages locally
      if (selectedConversation) {
        setSelectedConversation({
          ...selectedConversation,
          messages: selectedConversation.messages?.filter((m: any) => m.id !== deleteMessageId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
    setDeleteMessageId(null);
  };

  const handleBlockConversation = async (convId: string, currentlyBlocked: boolean) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          is_blocked: !currentlyBlocked, 
          blocked_at: !currentlyBlocked ? new Date().toISOString() : null,
          status: !currentlyBlocked ? 'blocked' : 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', convId);
      if (error) throw error;
      toast({ title: currentlyBlocked ? 'Conversație deblocată' : 'Conversație blocată' });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
    setBlockConvId(null);
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      // Delete messages first, then conversation
      const { error: msgError } = await supabase.from('messages').delete().eq('conversation_id', convId);
      if (msgError) throw msgError;
      const { error } = await supabase.from('conversations').delete().eq('id', convId);
      if (error) throw error;
      toast({ title: 'Conversație ștearsă' });
      setSelectedConversation(null);
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Mesaje Globale</h1>
          <p className="text-xs text-muted-foreground">Vizualizează și moderează conversațiile</p>
        </div>

        <Card>
          <CardHeader className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <MessageCircle className="h-4 w-4" />
                  Conversații
                </CardTitle>
                <CardDescription className="text-xs">{conversations?.length || 0} total</CardDescription>
              </div>
              <div className="relative w-full sm:w-40">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input 
                  placeholder="Caută..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : filteredConversations && filteredConversations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Listare</TableHead>
                      <TableHead className="text-xs">Mesaje</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Activitate</TableHead>
                      <TableHead className="text-right text-xs">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConversations.map((conv) => (
                      <TableRow key={conv.id}>
                        <TableCell className="font-mono text-[10px] p-2">
                          {conv.id.slice(0, 6)}...
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs p-2">
                          {conv.listings?.title?.slice(0, 15) || 'Necunoscut'}...
                        </TableCell>
                        <TableCell className="p-2">
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            {conv.messages?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-2">
                          {conv.is_blocked ? (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0">Blocată</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">Activă</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs p-2">
                          {new Date(conv.updated_at).toLocaleDateString('ro-RO')}
                        </TableCell>
                        <TableCell className="text-right p-2">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-6 w-6"
                              onClick={() => setSelectedConversation(conv)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6"
                              onClick={() => handleBlockConversation(conv.id, !!conv.is_blocked)}>
                              {conv.is_blocked ? (
                                <Unlock className="h-3 w-3 text-green-500" />
                              ) : (
                                <Ban className="h-3 w-3 text-amber-500" />
                              )}
                            </Button>
                            <AlertDialog>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                                onClick={() => handleDeleteConversation(conv.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Nicio conversație
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Conversation Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Detalii Conversație</DialogTitle>
            <DialogDescription className="text-xs">
              Re: {selectedConversation?.listings?.title?.slice(0, 30) || 'Necunoscut'}...
              {selectedConversation?.is_blocked && (
                <Badge variant="destructive" className="ml-2 text-[10px]">Blocată</Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64 pr-2">
            <div className="space-y-2">
              {selectedConversation?.messages
                ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((msg: any) => (
                  <div key={msg.id} className="p-2 rounded-lg bg-muted group relative">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {msg.sender_id?.slice(0, 6)}...
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString('ro-RO')}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => setDeleteMessageId(msg.id)}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs">{msg.content}</p>
                  </div>
                ))}
              {(!selectedConversation?.messages || selectedConversation.messages.length === 0) && (
                <p className="text-center text-muted-foreground py-6 text-xs">Niciun mesaj</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Message Confirmation */}
      <AlertDialog open={!!deleteMessageId} onOpenChange={() => setDeleteMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge Mesajul?</AlertDialogTitle>
            <AlertDialogDescription>
              Mesajul va fi șters permanent din conversație.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive text-destructive-foreground">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}