import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageItem } from './MessageItem';
import { EmojiPicker } from './EmojiPicker';
import { ImageUploadButton } from './ImageUploadButton';
import { useMessages, useSendMessage, useMarkMessagesRead, useDeleteConversation } from '@/hooks/useConversations';
import { useRealTimeMessages } from '@/hooks/useRealTimeNotifications';
import { useMessageTranslation } from '@/hooks/useTranslation';
import { 
  Send, ArrowLeft, Package, MoreVertical, Trash2, 
  PanelRightOpen, PanelRightClose, Shield, ExternalLink,
  Languages
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

interface MessageThreadProps {
  conversation: any;
  currentUserId: string;
  onBack?: () => void;
  onConversationDeleted?: () => void;
  isMobile?: boolean;
  showDetailsPanel?: boolean;
  onToggleDetails?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  currentUserId,
  onBack,
  onConversationDeleted,
  isMobile,
  showDetailsPanel,
  onToggleDetails,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [translationsEnabled, setTranslationsEnabled] = useState(true);
  const [translatedMessages, setTranslatedMessages] = useState<Map<string, string>>(new Map());
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: messages, isLoading } = useMessages(conversation?.id);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const deleteConversation = useDeleteConversation();
  const { translateBatch, isTranslating, userLanguage } = useMessageTranslation();
  
  useRealTimeMessages(conversation?.id);

  const isBuyer = conversation?.buyer_id === currentUserId;
  const otherUser = isBuyer ? conversation?.seller : conversation?.buyer;
  const listing = conversation?.listings;

  // Translate messages when they load
  useEffect(() => {
    if (messages && messages.length > 0 && translationsEnabled) {
      const translateMessages = async () => {
        const toTranslate = messages
          .filter(m => m.sender_id !== currentUserId)
          .map(m => ({ id: m.id, content: m.content }));
        
        if (toTranslate.length > 0) {
          const translations = await translateBatch(toTranslate, userLanguage);
          setTranslatedMessages(translations);
        }
      };
      translateMessages();
    }
  }, [messages, translationsEnabled, userLanguage]);

  // Mark messages as read
  useEffect(() => {
    if (conversation?.id && currentUserId) {
      markRead.mutate({ conversationId: conversation.id, userId: currentUserId });
    }
  }, [conversation?.id, currentUserId, messages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollAreaRef.current && messages?.length) {
      requestAnimationFrame(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !conversation?.id) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        senderId: currentUserId,
        content: trimmed,
      });
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  const handleImageUploaded = async (imageUrl: string) => {
    if (!conversation?.id) return;
    await sendMessage.mutateAsync({
      conversationId: conversation.id,
      senderId: currentUserId,
      content: imageUrl,
    });
  };

  const handleDelete = async () => {
    if (!conversation?.id) return;
    try {
      await deleteConversation.mutateAsync({ conversationId: conversation.id });
      toast.success('Conversație ștearsă');
      setShowDeleteDialog(false);
      onConversationDeleted?.();
      onBack?.();
    } catch (error) {
      toast.error('Nu s-a putut șterge');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Empty state
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted/30 to-background">
        <div className="text-center p-8 max-w-sm">
          <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Send className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Selectează o conversație</h3>
          <p className="text-sm text-muted-foreground">
            Alege o conversație din lista din stânga pentru a vedea mesajele
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        {isMobile && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Product thumbnail */}
        <Link to={`/listing/${listing?.id}`} className="flex-shrink-0">
          {listing?.listing_images?.[0]?.image_url ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
              <img 
                src={listing.listing_images[0].image_url} 
                alt={listing?.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate text-sm">
              {otherUser?.display_name || otherUser?.username || 'Utilizator'}
            </p>
            <Badge variant="outline" className="text-[10px] px-1.5">
              {isBuyer ? 'Vânzător' : 'Cumpărător'}
            </Badge>
          </div>
          <Link 
            to={`/listing/${listing?.id}`}
            className="text-xs text-muted-foreground truncate block hover:text-primary transition-colors"
          >
            {listing?.title || 'Produs'}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Translation toggle */}
          <Button
            variant={translationsEnabled ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setTranslationsEnabled(!translationsEnabled)}
            title={translationsEnabled ? 'Dezactivează traducerea' : 'Activează traducerea'}
          >
            <Languages className="h-4 w-4" />
          </Button>

          {!isMobile && onToggleDetails && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleDetails}>
              {showDetailsPanel ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/listing/${listing?.id}`} className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Vezi produsul
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Șterge conversația
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge conversația?</AlertDialogTitle>
            <AlertDialogDescription>
              Toate mesajele vor fi șterse permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Messages */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20"
        style={{ minHeight: 0 }}
      >
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex gap-2 ${i % 2 ? 'justify-end' : ''}`}>
                <Skeleton className="h-16 w-48 rounded-xl" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
              translatedContent={translationsEnabled ? translatedMessages.get(message.id) : undefined}
              showTranslation={translationsEnabled && message.sender_id !== currentUserId}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center p-6 bg-card rounded-2xl shadow-sm border border-border">
              <Send className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Niciun mesaj încă</p>
              <p className="text-sm text-muted-foreground mt-1">Începe conversația!</p>
            </div>
          </div>
        )}
        
        {isTranslating && (
          <div className="text-center text-xs text-muted-foreground animate-pulse">
            Se traduc mesajele...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex-shrink-0 p-3 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <EmojiPicker onEmojiSelect={(e) => setNewMessage(prev => prev + e)} />
          <ImageUploadButton 
            onImageUploaded={handleImageUploaded}
            disabled={sendMessage.isPending}
          />
          
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrie un mesaj..."
            className="flex-1 rounded-full"
            disabled={sendMessage.isPending}
          />
          
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="rounded-full h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
