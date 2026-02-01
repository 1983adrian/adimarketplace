import React, { useState } from 'react';
import { Check, CheckCheck, Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Message } from '@/types/database';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  translatedContent?: string;
  showTranslation?: boolean;
}

const isImageUrl = (content: string): boolean => {
  return content.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null || 
         content.includes('supabase.co/storage');
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  translatedContent,
  showTranslation = false,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const isImage = isImageUrl(message.content);
  
  const hasTranslation = showTranslation && translatedContent && translatedContent !== message.content;
  const displayContent = hasTranslation && !showOriginal ? translatedContent : message.content;

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[75%] rounded-2xl shadow-sm',
        isOwn 
          ? 'bg-primary text-primary-foreground rounded-br-md' 
          : 'bg-card border border-border rounded-bl-md'
      )}>
        {/* Message Content */}
        <div className="px-4 py-2.5">
          {isImage ? (
            <a href={message.content} target="_blank" rel="noopener noreferrer">
              <img 
                src={message.content} 
                alt="Imagine"
                className="max-w-full h-auto rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            </a>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {displayContent}
            </p>
          )}
        </div>

        {/* Translation indicator & toggle */}
        {hasTranslation && !isImage && (
          <div className={cn(
            'px-3 py-1.5 border-t flex items-center gap-2',
            isOwn ? 'border-primary-foreground/20' : 'border-border'
          )}>
            <Languages className={cn(
              'h-3 w-3',
              isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )} />
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={cn(
                'text-[10px] flex items-center gap-1 hover:underline',
                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {showOriginal ? 'Vezi traducerea' : 'Vezi originalul'}
              {showOriginal ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        )}

        {/* Footer with time and read status */}
        <div className={cn(
          'flex items-center gap-1.5 px-3 pb-2 pt-0.5',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <span className={cn(
            'text-[10px]',
            isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}>
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
          {isOwn && (
            message.is_read ? (
              <CheckCheck className={cn(
                'h-3.5 w-3.5',
                isOwn ? 'text-emerald-300' : 'text-emerald-500'
              )} />
            ) : (
              <Check className={cn(
                'h-3.5 w-3.5',
                isOwn ? 'text-primary-foreground/50' : 'text-muted-foreground'
              )} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
