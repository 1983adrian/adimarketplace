import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';

interface ConversationListProps {
  conversations: any[];
  isLoading: boolean;
  selectedId?: string;
  currentUserId: string;
  onSelect: (conversation: any) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  selectedId,
  currentUserId,
  onSelect,
}) => {
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOtherUser = (conversation: any) => {
    return conversation.buyer_id === currentUserId
      ? conversation.seller
      : conversation.buyer;
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
        <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="font-medium">Nicio conversație</p>
        <p className="text-sm">Începe o conversație din pagina unui produs</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation);
          const isSelected = selectedId === conversation.id;
          
          return (
            <div
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                isSelected ? 'bg-muted' : ''
              }`}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(otherUser?.display_name || otherUser?.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium truncate">
                    {otherUser?.display_name || otherUser?.username || 'Utilizator'}
                  </p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(conversation.updated_at), {
                      addSuffix: true,
                      locale: ro,
                    })}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.listings?.title || 'Produs șters'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
