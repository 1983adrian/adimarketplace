import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { MessageCircle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationListProps {
  conversations: any[];
  isLoading: boolean;
  selectedId?: string;
  currentUserId: string;
  onSelect: (conversation: any) => void;
}

// Admin contact info
const ADMIN_EMAIL = 'adrianchirita01@gmail.com';

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  selectedId,
  currentUserId,
  onSelect,
}) => {
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [adminConversation, setAdminConversation] = useState<any>(null);

  // Fetch admin profile
  useEffect(() => {
    const fetchAdmin = async () => {
      // Get admin user
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .limit(100);
      
      // Find admin by checking user_roles
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (adminRoles && adminRoles.length > 0) {
        const adminUserId = adminRoles[0].user_id;
        const admin = profiles?.find(p => p.user_id === adminUserId);
        if (admin && admin.user_id !== currentUserId) {
          setAdminProfile({
            ...admin,
            display_name: admin.display_name || 'Admin C Market',
            isAdmin: true
          });
        }
      }
    };

    fetchAdmin();
  }, [currentUserId]);

  // Check if there's already a conversation with admin
  useEffect(() => {
    if (adminProfile && conversations) {
      const existing = conversations.find(
        c => c.buyer_id === adminProfile.user_id || c.seller_id === adminProfile.user_id
      );
      setAdminConversation(existing);
    }
  }, [adminProfile, conversations]);

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOtherUser = (conversation: any) => {
    return conversation.buyer_id === currentUserId
      ? conversation.seller
      : conversation.buyer;
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleAdminClick = () => {
    if (adminConversation) {
      onSelect(adminConversation);
    } else if (adminProfile) {
      // Create a pseudo-conversation to show admin
      onSelect({
        id: 'admin-new',
        buyer_id: currentUserId,
        seller_id: adminProfile.user_id,
        seller: adminProfile,
        buyer: null,
        isNewAdminChat: true,
        listings: null
      });
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {/* Admin Contact - Always at top */}
        {adminProfile && (
          <div
            onClick={handleAdminClick}
            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-primary/10 bg-gradient-to-r from-primary/5 to-transparent border-b-2 border-primary/20 ${
              selectedId === 'admin-new' || (adminConversation && selectedId === adminConversation.id) ? 'bg-primary/10' : ''
            }`}
          >
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-primary/50">
                <AvatarImage src={adminProfile.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Shield className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 border-2 border-background" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-primary">
                  {adminProfile.display_name || 'Admin C Market'}
                </p>
                <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Suport & Asistență 24/7
              </p>
            </div>
          </div>
        )}

        {/* Regular conversations */}
        {conversations.length === 0 && !adminProfile ? (
          <div className="flex flex-col items-center justify-center h-64 p-8 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="font-medium">Nicio conversație</p>
            <p className="text-sm">Începe o conversație din pagina unui produs</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const isSelected = selectedId === conversation.id;
            
            return (
              <div
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  isSelected ? 'bg-muted' : ''
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherUser?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(otherUser?.display_name || otherUser?.username)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium truncate">
                      {otherUser?.display_name || otherUser?.username || 'Utilizator'}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(conversation.updated_at), {
                        addSuffix: true,
                        locale: ro,
                      })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.listings?.title || 'Produs șters'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
};
