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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Global Messages</h1>
          <p className="text-muted-foreground">View all conversations on the platform for moderation</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  All Conversations
                </CardTitle>
                <CardDescription>{conversations?.length || 0} total conversations</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search conversations..."
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
            ) : filteredConversations && filteredConversations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conversation</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.map((conv) => (
                    <TableRow key={conv.id}>
                      <TableCell className="font-mono text-sm">
                        {conv.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {conv.listings?.title || 'Unknown Listing'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {conv.messages?.length || 0} messages
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedConversation(conv)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No conversations found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Conversation Details</DialogTitle>
            <DialogDescription>
              Regarding: {selectedConversation?.listings?.title || 'Unknown Listing'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96 pr-4">
            <div className="space-y-3">
              {selectedConversation?.messages
                ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((msg: any) => (
                  <div 
                    key={msg.id}
                    className="p-3 rounded-lg bg-muted"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {msg.sender_id?.slice(0, 8)}...
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
              {(!selectedConversation?.messages || selectedConversation.messages.length === 0) && (
                <p className="text-center text-muted-foreground py-8">No messages in this conversation</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
