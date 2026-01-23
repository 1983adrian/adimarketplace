import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { NotificationBadge } from '@/components/ui/NotificationBadge';

export const FloatingChatButton: React.FC = () => {
  const { user } = useAuth();
  const { data: unreadMessages = 0 } = useUnreadMessages();

  if (!user) return null;

  return (
    <Link to="/messages">
      <Button 
        size="icon"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#20BD5A] hover:to-[#0E7A66] transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="h-6 w-6 text-white" />
        {unreadMessages > 0 && (
          <NotificationBadge 
            count={unreadMessages} 
            size="md" 
            className="-top-1 -right-1" 
          />
        )}
      </Button>
    </Link>
  );
};

export default FloatingChatButton;
