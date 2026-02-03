import React, { forwardRef } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Message } from '@/types/database';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

// Check if content is an image URL
const isImageUrl = (content: string): boolean => {
  return content.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null || 
         content.includes('supabase.co/storage');
};

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(({
  message,
  isOwn,
}, ref) => {
  const isImage = isImageUrl(message.content);

  return (
    <div ref={ref} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-4 py-2.5 shadow-lg ${
            isOwn
              ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl rounded-br-sm shadow-primary/20'
              : 'bg-muted text-foreground rounded-2xl rounded-bl-sm border border-border shadow-sm'
          }`}
        >
          {isImage ? (
            <a href={message.content} target="_blank" rel="noopener noreferrer">
              <img 
                src={message.content} 
                alt="Shared image"
                className="max-w-full h-auto rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity ring-1 ring-border"
              />
            </a>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          )}
          
          {/* Time and read status */}
          <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isOwn ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'}`}>
            <span>{format(new Date(message.created_at), 'HH:mm')}</span>
            {isOwn && (
              message.is_read ? (
                <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Check className="h-3.5 w-3.5 text-primary-foreground/50" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
