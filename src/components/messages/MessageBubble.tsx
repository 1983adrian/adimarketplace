import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const isImage = message.content.startsWith('http') && /\.(jpg|jpeg|png|gif|webp)/i.test(message.content);

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        {isImage ? (
          <img src={message.content} alt="Shared" className="rounded-lg max-w-full max-h-60 object-cover" />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <p className={cn('text-[10px] mt-1', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
    </div>
  );
};
