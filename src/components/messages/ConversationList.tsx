import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { MessageCircle, Image, Trash2, MoreVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConversationListProps {
  conversations: any[];
  isLoading: boolean;
  selectedId?: string;
  currentUserId: string;
  onSelect: (conversation: any) => void;
  onDelete?: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  selectedId,
  currentUserId,
  onSelect,
  onDelete,
}) => {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Fetch unread counts for each conversation
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!conversations || conversations.length === 0) return;

      const counts: Record<string, number> = {};
      
      for (const conv of conversations) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', currentUserId);
        
        counts[conv.id] = count || 0;
      }
      
      setUnreadCounts(counts);
    };

    fetchUnreadCounts();
  }, [conversations, currentUserId]);

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOtherUser = (conversation: any) => {
    return conversation.buyer_id === currentUserId
      ? conversation.seller
      : conversation.buyer;
  };

  const isImageUrl = (content?: string): boolean => {
    if (!content) return false;
    return content.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null || 
           content.includes('supabase.co/storage');
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete && onDelete) {
      onDelete(conversationToDelete);
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-0 h-full" style={{ background: 'linear-gradient(180deg, hsl(215 30% 14%) 0%, hsl(215 30% 10%) 100%)' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-white/10">
            <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-3 w-full bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'linear-gradient(180deg, hsl(215 30% 14%) 0%, hsl(215 30% 10%) 100%)' }}>
      {/* Header - Premium dark blue style */}
      <div className="sticky top-0 bg-gradient-to-r from-[hsl(215_30%_18%)] to-[hsl(215_30%_14%)] text-white px-4 py-3 z-10 shadow-lg border-b border-white/10">
        <h2 className="font-bold text-lg">Chat</h2>
      </div>

      <div className="divide-y divide-white/10">
        {/* Conversations */}
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <p className="font-medium text-white">Nicio conversație</p>
            <p className="text-sm text-white/50">Începe o conversație din pagina unui produs</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const isSelected = selectedId === conversation.id;
            const unreadCount = unreadCounts[conversation.id] || 0;
            
            return (
              <div
                key={conversation.id}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                  isSelected ? 'bg-white/10 border-l-2 border-primary' : ''
                }`}
              >
                {/* Clickable area for selecting conversation */}
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => onSelect(conversation)}
                >
                  {/* User Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-lg">
                      <AvatarImage src={otherUser?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white">
                        {getInitials(otherUser?.display_name || otherUser?.username)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${unreadCount > 0 ? 'text-white font-semibold' : 'text-white/80'}`}>
                          {otherUser?.display_name || otherUser?.username || 'Utilizator'}
                        </p>
                      </div>
                      <span className={`text-xs flex-shrink-0 ${unreadCount > 0 ? 'text-primary font-medium' : 'text-white/40'}`}>
                        {formatDistanceToNow(new Date(conversation.updated_at), {
                          addSuffix: false,
                          locale: ro,
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate flex items-center gap-1 ${unreadCount > 0 ? 'text-white font-medium' : 'text-white/50'}`}>
                        {isImageUrl(conversation.last_message) ? (
                          <>
                            <Image className="h-3.5 w-3.5" />
                            <span>Imagine</span>
                          </>
                        ) : conversation.last_message ? (
                          conversation.last_message
                        ) : (
                          <span className="text-white/30 italic">Niciun mesaj încă</span>
                        )}
                      </p>
                      
                      {unreadCount > 0 && (
                        <Badge className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 shadow-lg shadow-primary/30">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 flex-shrink-0 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-md border-white/10">
                    <DropdownMenuItem 
                      className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                      onClick={(e) => handleDeleteClick(e, conversation.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Șterge conversația
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge conversația?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Toate mesajele din această conversație vor fi șterse permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConversationList;
