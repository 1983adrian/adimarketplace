import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import { useMessages, useSendMessage, useMarkMessagesRead } from '@/hooks/useConversations';
import { Send, ArrowLeft, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Profile } from '@/types/database';

interface ChatWindowProps {
  conversation: any;
  currentUserId: string;
  onBack?: () => void;
  isMobile?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  onBack,
  isMobile,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading } = useMessages(conversation?.id);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();

  const otherUser = conversation?.buyer_id === currentUserId
    ? conversation?.seller
    : conversation?.buyer;

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    if (conversation?.id && currentUserId) {
      markRead.mutate({ conversationId: conversation.id, userId: currentUserId });
    }
  }, [conversation?.id, currentUserId, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation?.id) return;

    await sendMessage.mutateAsync({
      conversationId: conversation.id,
      senderId: currentUserId,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  const getSenderProfile = (senderId: string): Profile | undefined => {
    if (senderId === conversation?.buyer_id) return conversation?.buyer;
    if (senderId === conversation?.seller_id) return conversation?.seller;
    return undefined;
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">Selectează o conversație</p>
          <p className="text-sm">Alege o conversație din lista din stânga</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        {isMobile && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser?.avatar_url || ''} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(otherUser?.display_name || otherUser?.username)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {otherUser?.display_name || otherUser?.username || 'Utilizator'}
          </p>
          {conversation.listings && (
            <Link 
              to={`/listing/${conversation.listing_id}`}
              className="text-sm text-muted-foreground hover:text-primary truncate block"
            >
              {conversation.listings.title}
            </Link>
          )}
        </div>

        {conversation.listings?.listing_images?.[0]?.image_url && (
          <Link to={`/listing/${conversation.listing_id}`}>
            <img 
              src={conversation.listings.listing_images[0].image_url} 
              alt={conversation.listings.title}
              className="h-12 w-12 rounded-lg object-cover border"
            />
          </Link>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'justify-end'}`}>
                {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                <Skeleton className="h-16 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                senderProfile={getSenderProfile(message.sender_id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-center">Niciun mesaj încă. Trimite primul mesaj!</p>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrie un mesaj..."
            className="flex-1"
            disabled={sendMessage.isPending}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || sendMessage.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
