import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './MessageBubble';
import { EmojiPicker } from './EmojiPicker';
import { ImageUploadButton } from './ImageUploadButton';
import { useMessages, useSendMessage, useMarkMessagesRead, useDeleteConversation } from '@/hooks/useConversations';
import { useRealTimeMessages } from '@/hooks/useRealTimeNotifications';
import { Send, ArrowLeft, Shield, Trash2, MoreVertical, X } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { toast } from 'sonner';

interface ChatWindowProps {
  conversation: any;
  currentUserId: string;
  onBack?: () => void;
  onConversationDeleted?: () => void;
  isMobile?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  onBack,
  onConversationDeleted,
  isMobile,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: messages, isLoading } = useMessages(conversation?.id !== 'admin-new' ? conversation?.id : undefined);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const deleteConversation = useDeleteConversation();
  
  // Enable real-time updates for this conversation
  useRealTimeMessages(conversation?.id !== 'admin-new' ? conversation?.id : undefined);

  // Handle admin chat or regular chat
  const isAdminChat = conversation?.isNewAdminChat;
  
  const otherUser = isAdminChat 
    ? conversation?.seller 
    : conversation?.buyer_id === currentUserId
      ? conversation?.seller
      : conversation?.buyer;

  const handleDeleteConversation = async () => {
    if (!conversation?.id) return;
    
    try {
      await deleteConversation.mutateAsync({ conversationId: conversation.id });
      toast.success('Conversația a fost ștearsă');
      setShowDeleteDialog(false);
      onConversationDeleted?.();
      onBack?.();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Nu s-a putut șterge conversația');
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    if (conversation?.id && conversation?.id !== 'admin-new' && currentUserId) {
      markRead.mutate({ conversationId: conversation.id, userId: currentUserId });
    }
  }, [conversation?.id, currentUserId, messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current && messages && messages.length > 0) {
      requestAnimationFrame(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      });
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


  if (!conversation) {
    return (
      <div 
        className="flex items-center justify-center h-full text-muted-foreground relative overflow-hidden"
        style={{ 
          background: '#0a0a0a',
        }}
      >
        {/* Background watermark text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[#1a1a1a] text-2xl md:text-4xl font-bold tracking-widest uppercase select-none">
            Marketplace Romania
          </p>
        </div>
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/10 z-10">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-white/60" />
          </div>
          <p className="text-lg font-medium text-white/80">Selectează o conversație</p>
          <p className="text-sm text-white/50 mt-1">Alege o conversație din lista din stânga</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header - WhatsApp style - FIXED height */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white shadow-md min-h-[64px]">
        {isMobile && onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="md:hidden text-white hover:bg-white/10 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10 border-2 border-white/20 flex-shrink-0">
          <AvatarImage src={otherUser?.avatar_url || ''} />
          <AvatarFallback className="bg-white/20 text-white">
            {isAdminChat || otherUser?.isAdmin ? (
              <Shield className="h-5 w-5" />
            ) : (
              getInitials(otherUser?.display_name || otherUser?.username)
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">
              {otherUser?.display_name || otherUser?.username || 'Utilizator'}
            </p>
            {(isAdminChat || otherUser?.isAdmin) && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex-shrink-0">Admin</span>
            )}
            {/* User ID Badge */}
            {!isAdminChat && !otherUser?.isAdmin && otherUser?.user_id && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                #{otherUser.user_id.slice(0, 6).toUpperCase()}
              </span>
            )}
          </div>
          {conversation.listings && (
            <Link 
              to={`/listing/${conversation.listing_id}`}
              className="text-xs text-white/70 hover:text-white truncate block max-w-full"
            >
              📦 {conversation.listings.title}
            </Link>
          )}
        </div>

        {conversation.listings?.listing_images?.[0]?.image_url && (
          <Link to={`/listing/${conversation.listing_id}`} className="flex-shrink-0">
            <img 
              src={conversation.listings.listing_images[0].image_url} 
              alt={conversation.listings.title}
              className="h-10 w-10 rounded-lg object-cover border-2 border-white/20"
            />
          </Link>
        )}

        {/* Delete/Close conversation menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 flex-shrink-0"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Șterge conversația
            </DropdownMenuItem>
            {isMobile && onBack && (
              <DropdownMenuItem onClick={onBack}>
                <X className="h-4 w-4 mr-2" />
                Închide chat
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge conversația?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este permanentă. Toate mesajele din această conversație vor fi șterse și nu pot fi recuperate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Messages area with dark background - SCROLLABLE container */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        style={{ 
          background: '#0a0a0a',
          minHeight: 0, // Critical for flex scroll
        }}
      >
        {/* Background watermark text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[#1a1a1a] text-xl md:text-3xl font-bold tracking-widest uppercase select-none whitespace-nowrap">
            Marketplace Romania
          </p>
        </div>
        
        <div className="p-4 min-h-full flex flex-col relative z-10">
          {isLoading ? (
            <div className="space-y-4 flex-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'justify-end'}`}>
                  {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 bg-white/10" />}
                  <Skeleton className="h-16 w-48 rounded-2xl bg-white/10" />
                </div>
              ))}
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-3 mt-auto">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === currentUserId}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 min-h-[200px]">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="h-5 w-5 text-white" />
                </div>
                <p className="text-white/80 font-medium">👋 Niciun mesaj încă</p>
                <p className="text-sm text-white/50 mt-1">Trimite primul mesaj!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area - WhatsApp style - FIXED at bottom */}
      <form onSubmit={handleSend} className="flex-shrink-0 p-2 bg-[#F0F0F0] border-t min-h-[60px]">
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
            className="flex-1 rounded-full border-0 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-primary/30 min-h-[40px]"
            disabled={sendMessage.isPending || conversation?.id === 'admin-new'}
          />
          
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || sendMessage.isPending || conversation?.id === 'admin-new'}
            className="rounded-full bg-[#00A884] hover:bg-[#008C72] text-white shadow-md h-10 w-10 flex-shrink-0"
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