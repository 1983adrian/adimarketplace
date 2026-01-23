import React from 'react';
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

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
}) => {
  const isImage = isImageUrl(message.content);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-3 py-2 shadow-sm ${
            isOwn
              ? 'bg-[#DCF8C6] text-gray-900 rounded-2xl rounded-br-sm'
              : 'bg-white text-gray-900 rounded-2xl rounded-bl-sm'
          }`}
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
          
          {/* Time and read status */}
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
