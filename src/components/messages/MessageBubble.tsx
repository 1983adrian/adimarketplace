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

// Check if content is an image URL
const isImageUrl = (content: string): boolean => {
  return content.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null || 
         content.includes('supabase.co/storage');
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  senderProfile,
}) => {
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isImage = isImageUrl(message.content);

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0 shadow-sm">
          <AvatarImage src={senderProfile?.avatar_url || ''} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-xs font-medium">
            {getInitials(senderProfile?.display_name || senderProfile?.username)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-3 py-2 shadow-sm ${
            isOwn
              ? 'bg-gradient-to-br from-[#DCF8C6] to-[#C5E8B7] text-gray-900 rounded-2xl rounded-br-md'
              : 'bg-white text-gray-900 rounded-2xl rounded-bl-md border border-gray-100'
          }`}
          style={{
            // WhatsApp-like bubble tail
            ...(isOwn ? {
              borderBottomRightRadius: '4px',
            } : {
              borderBottomLeftRadius: '4px',
            })
          }}
        >
          {isImage ? (
            <a href={message.content} target="_blank" rel="noopener noreferrer">
              <img 
                src={message.content} 
                alt="Shared image"
                className="max-w-full h-auto rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            </a>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          )}
          
          {/* Time and read status inside bubble */}
          <div className={`flex items-center gap-1 mt-1 text-[10px] ${isOwn ? 'text-gray-600 justify-end' : 'text-gray-500'}`}>
            <span>{format(new Date(message.created_at), 'HH:mm')}</span>
            {isOwn && (
              message.is_read ? (
                <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
              ) : (
                <Check className="h-3.5 w-3.5 text-gray-400" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
