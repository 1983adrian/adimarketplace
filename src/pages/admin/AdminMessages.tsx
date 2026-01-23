import { useState } from 'react';
import { Search, MessageCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllConversations } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminMessages() {
  const [search, setSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const { data: conversations, isLoading } = useAllConversations();

  const filteredConversations = conversations?.filter(conv => 
    conv.listings?.title?.toLowerCase().includes(search.toLowerCase()) ||
    conv.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Mesaje Globale</h1>
          <p className="text-xs text-muted-foreground">Vizualizează toate conversațiile pentru moderare</p>
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
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredConversations && filteredConversations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Listare</TableHead>
                      <TableHead className="text-xs">Mesaje</TableHead>
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
                        <TableCell className="hidden md:table-cell text-xs p-2">
                          {new Date(conv.updated_at).toLocaleDateString('ro-RO')}
                        </TableCell>
                        <TableCell className="text-right p-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setSelectedConversation(conv)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
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

      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Detalii Conversație</DialogTitle>
            <DialogDescription className="text-xs">
              Re: {selectedConversation?.listings?.title?.slice(0, 30) || 'Necunoscut'}...
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64 pr-2">
            <div className="space-y-2">
              {selectedConversation?.messages
                ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((msg: any) => (
                  <div 
                    key={msg.id}
                    className="p-2 rounded-lg bg-muted"
                  >
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {msg.sender_id?.slice(0, 6)}...
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString('ro-RO')}
                      </span>
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
    </AdminLayout>
  );
}
