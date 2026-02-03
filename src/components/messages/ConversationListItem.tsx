import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { Package, Image, MoreVertical, Trash2, ShoppingCart, Store, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationListItemProps {
  conversation: any;
  currentUserId: string;
  isSelected: boolean;
  onSelect: (conversation: any) => void;
  onDelete?: (conversationId: string) => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  currentUserId,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const { language } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  const isBuyer = conversation.buyer_id === currentUserId;
  const otherUser = isBuyer ? conversation.seller : conversation.buyer;
  const listing = conversation.listings;
  const listingImage = listing?.listing_images?.[0]?.image_url;

  // Fetch unread count
  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversation.id)
        .eq('is_read', false)
        .neq('sender_id', currentUserId);
      
      setUnreadCount(count || 0);
    };
    fetchUnread();
  }, [conversation.id, currentUserId]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isImageUrl = (content?: string): boolean => {
    if (!content) return false;
    return content.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null || 
           content.includes('supabase.co/storage');
  };

  const getStatusBadge = () => {
    if (conversation.is_blocked) {
      return <Badge variant="destructive" className="text-[10px] px-1.5">Blocat</Badge>;
    }
    if (conversation.status === 'closed') {
      return <Badge variant="secondary" className="text-[10px] px-1.5">Închis</Badge>;
    }
    if (conversation.order_id) {
      return <Badge className="text-[10px] px-1.5 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">Comandă</Badge>;
    }
    return null;
  };

  return (
    <div
      className={`flex gap-3 p-3 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
        isSelected ? 'bg-primary/10 border-l-2 border-primary' : ''
      } ${unreadCount > 0 ? 'bg-primary/5' : ''}`}
    >
      {/* Product Image */}
      <div 
        className="relative flex-shrink-0"
        onClick={() => onSelect(conversation)}
      >
        {listingImage ? (
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shadow-sm">
            <img 
              src={listingImage} 
              alt={listing?.title} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        
        {/* Role indicator */}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
          isBuyer ? 'bg-blue-500' : 'bg-emerald-500'
        }`}>
          {isBuyer ? (
            <ShoppingCart className="h-3 w-3 text-white" />
          ) : (
            <Store className="h-3 w-3 text-white" />
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 min-w-0 py-0.5"
        onClick={() => onSelect(conversation)}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <p className={`font-medium truncate text-sm ${unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
              {otherUser?.display_name || otherUser?.username || 'Utilizator'}
            </p>
            {getStatusBadge()}
          </div>
          <span className={`text-[11px] flex-shrink-0 ${unreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            {formatDistanceToNow(new Date(conversation.updated_at), {
              addSuffix: false,
              locale: language === 'ro' ? ro : enUS,
            })}
          </span>
        </div>

        {/* Product Title */}
        <p className="text-xs text-muted-foreground truncate mb-1">
          Re: {listing?.title || 'Produs necunoscut'}
        </p>

        {/* Last Message */}
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate flex items-center gap-1 ${unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {isImageUrl(conversation.last_message) ? (
              <>
                <Image className="h-3.5 w-3.5" />
                <span>Imagine</span>
              </>
            ) : conversation.last_message ? (
              conversation.last_message.length > 40 
                ? conversation.last_message.substring(0, 40) + '...'
                : conversation.last_message
            ) : (
              <span className="text-muted-foreground/50 italic">Niciun mesaj</span>
            )}
          </p>
          
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete?.(conversation.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Șterge conversația
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ConversationListItem;
