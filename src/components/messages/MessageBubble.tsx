import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Message, Profile } from '@/types/database';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderProfile?: Profile;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  senderProfile,
}) => {
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderProfile?.avatar_url || ''} />
          <AvatarFallback className="bg-muted text-xs">
            {getInitials(senderProfile?.display_name || senderProfile?.username)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span>{format(new Date(message.created_at), 'HH:mm')}</span>
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="h-3 w-3 text-primary" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </div>
  );
};
