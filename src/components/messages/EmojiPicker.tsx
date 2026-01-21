import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';

const EMOJI_CATEGORIES = {
  'Frecvente': ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '😊', '🙏'],
  'Emoții': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨'],
  'Gesturi': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏', '✍️', '💪', '🦾', '🙌', '👏', '🤲', '🤜', '🤛', '👊', '✊'],
  'Obiecte': ['📦', '🎁', '💰', '💳', '📱', '💻', '⌚', '📷', '🎮', '🎧', '🎵', '🔔', '📧', '✉️', '📝', '📌', '📍', '🔑', '🔒', '❌', '✅', '⭐', '💫', '🌟', '⚡', '🎯', '🏆', '🥇', '🎪', '🎭'],
  'Natură': ['☀️', '🌙', '⭐', '🌈', '☁️', '⛈️', '❄️', '🌊', '🌺', '🌸', '🌷', '🌹', '🌻', '🌴', '🌲', '🍀', '🍁', '🍂', '🍃', '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐮', '🐷'],
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Frecvente');

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className="h-10 w-10 hover:bg-primary/10"
        >
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        side="top" 
        align="start"
        sideOffset={10}
      >
        <div className="border-b p-2">
          <div className="flex gap-1 overflow-x-auto">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'secondary' : 'ghost'}
                size="sm"
                className="text-xs whitespace-nowrap"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div className="p-2 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                className="text-xl p-1.5 hover:bg-muted rounded transition-colors"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
