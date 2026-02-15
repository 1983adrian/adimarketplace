import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EMOJI_LIST = ['😀', '😂', '❤️', '👍', '👎', '🔥', '🎉', '😍', '🤔', '😢', '😡', '👋', '🙏', '💪', '✅', '❌', '📦', '💰', '🛒', '⭐'];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0">
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" side="top" align="start">
        <div className="grid grid-cols-5 gap-1">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="text-xl p-1.5 rounded hover:bg-muted transition-colors"
              onClick={() => {
                onEmojiSelect(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
