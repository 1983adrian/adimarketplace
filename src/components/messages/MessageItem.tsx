import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Languages } from 'lucide-react';

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  isOwn: boolean;
  translatedContent?: string;
  showTranslation?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, translatedContent, showTranslation }) => {
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
          <>
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            {showTranslation && translatedContent && translatedContent !== message.content && (
              <div className={cn('mt-1 pt-1 border-t text-xs flex items-center gap-1', isOwn ? 'border-primary-foreground/20 text-primary-foreground/80' : 'border-border text-muted-foreground')}>
                <Languages className="h-3 w-3" />
                {translatedContent}
              </div>
            )}
          </>
        )}
        <p className={cn('text-[10px] mt-1', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
    </div>
  );
};
