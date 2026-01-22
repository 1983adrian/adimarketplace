import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import { EmojiPicker } from './EmojiPicker';
import { ImageUploadButton } from './ImageUploadButton';
import { useMessages, useSendMessage, useMarkMessagesRead } from '@/hooks/useConversations';
import { useRealTimeMessages } from '@/hooks/useRealTimeNotifications';
import { Send, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Profile } from '@/types/database';

interface ChatWindowProps {
  conversation: any;
  currentUserId: string;
  onBack?: () => void;
  isMobile?: boolean;
}

// WhatsApp-like chat background pattern
const CHAT_BACKGROUND = `
  radial-gradient(circle at 25% 25%, rgba(37, 211, 102, 0.03) 0%, transparent 50%),
  radial-gradient(circle at 75% 75%, rgba(37, 211, 102, 0.03) 0%, transparent 50%),
  linear-gradient(to bottom, #E5DDD5 0%, #D1C7BC 100%)
`;

const CHAT_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  onBack,
  isMobile,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: messages, isLoading } = useMessages(conversation?.id !== 'admin-new' ? conversation?.id : undefined);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  
  // Enable real-time updates for this conversation
  useRealTimeMessages(conversation?.id !== 'admin-new' ? conversation?.id : undefined);

  // Handle admin chat or regular chat
  const isAdminChat = conversation?.isNewAdminChat;
  
  const otherUser = isAdminChat 
    ? conversation?.seller 
    : conversation?.buyer_id === currentUserId
      ? conversation?.seller
      : conversation?.buyer;

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    if (conversation?.id && conversation?.id !== 'admin-new' && currentUserId) {
      markRead.mutate({ conversationId: conversation.id, userId: currentUserId });
    }
  }, [conversation?.id, currentUserId, messages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    
    if (!trimmedMessage || !conversation?.id || conversation?.id === 'admin-new') return;

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        senderId: currentUserId,
        content: trimmedMessage,
      });
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleImageUploaded = async (imageUrl: string) => {
    if (!conversation?.id || conversation?.id === 'admin-new') return;
    
    await sendMessage.mutateAsync({
      conversationId: conversation.id,
      senderId: currentUserId,
      content: imageUrl,
    });
  };

  const getSenderProfile = (senderId: string): Profile | undefined => {
    if (senderId === conversation?.buyer_id) return conversation?.buyer;
    if (senderId === conversation?.seller_id) return conversation?.seller;
    return undefined;
  };

  if (!conversation) {
    return (
      <div 
        className="flex items-center justify-center h-full text-muted-foreground"
        style={{ 
          background: CHAT_BACKGROUND,
          backgroundImage: CHAT_PATTERN,
        }}
      >
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-gray-800">Selectează o conversație</p>
          <p className="text-sm text-gray-500 mt-1">Alege o conversație din lista din stânga</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - WhatsApp style */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white shadow-md">
        {isMobile && onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="md:hidden text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10 border-2 border-white/20">
          <AvatarImage src={otherUser?.avatar_url || ''} />
          <AvatarFallback className="bg-white/20 text-white">
            {isAdminChat || otherUser?.isAdmin ? (
              <Shield className="h-5 w-5" />
            ) : (
              getInitials(otherUser?.display_name || otherUser?.username)
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">
              {otherUser?.display_name || otherUser?.username || 'Utilizator'}
            </p>
            {(isAdminChat || otherUser?.isAdmin) && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
            )}
            {/* User ID Badge */}
            {!isAdminChat && !otherUser?.isAdmin && otherUser?.user_id && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                #{otherUser.user_id.slice(0, 6).toUpperCase()}
              </span>
            )}
          </div>
          {conversation.listings && (
            <Link 
              to={`/listing/${conversation.listing_id}`}
              className="text-xs text-white/70 hover:text-white truncate block"
            >
              📦 {conversation.listings.title}
            </Link>
          )}
        </div>

        {conversation.listings?.listing_images?.[0]?.image_url && (
          <Link to={`/listing/${conversation.listing_id}`}>
            <img 
              src={conversation.listings.listing_images[0].image_url} 
              alt={conversation.listings.title}
              className="h-10 w-10 rounded-lg object-cover border-2 border-white/20"
            />
          </Link>
        )}
      </div>

      {/* Messages area with WhatsApp background - Fixed container with proper scrolling */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ 
          background: CHAT_BACKGROUND,
          backgroundImage: CHAT_PATTERN,
        }}
      >
        <div className="p-4 flex flex-col justify-end" style={{ minHeight: '100%' }}>
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
            <div className="space-y-3">
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
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="h-5 w-5 text-white" />
                </div>
                <p className="text-gray-700 font-medium">👋 Niciun mesaj încă</p>
                <p className="text-sm text-gray-500 mt-1">Trimite primul mesaj!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area - WhatsApp style - Fixed at bottom */}
      <form onSubmit={handleSend} className="flex-shrink-0 p-2 bg-[#F0F0F0] border-t">
        <div className="flex items-center gap-1">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <ImageUploadButton 
            onImageUploaded={handleImageUploaded}
            disabled={sendMessage.isPending || !conversation?.id || conversation?.id === 'admin-new'}
          />
          
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrie un mesaj..."
            className="flex-1 rounded-full border-0 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-primary/30"
            disabled={sendMessage.isPending || conversation?.id === 'admin-new'}
          />
          
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || sendMessage.isPending || conversation?.id === 'admin-new'}
            className="rounded-full bg-[#00A884] hover:bg-[#008C72] text-white shadow-md h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {conversation?.id === 'admin-new' && (
          <p className="text-xs text-center text-amber-600 mt-2">
            Pentru a trimite mesaje adminului, contactează-l printr-un produs sau comandă specifică.
          </p>
        )}
      </form>
    </div>
  );
};

export default ChatWindow;
