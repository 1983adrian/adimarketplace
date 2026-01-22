import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { MessageCircle, Shield, CheckCheck, Check, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationListProps {
  conversations: any[];
  isLoading: boolean;
  selectedId?: string;
  currentUserId: string;
  onSelect: (conversation: any) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  selectedId,
  currentUserId,
  onSelect,
}) => {
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [adminConversation, setAdminConversation] = useState<any>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Fetch admin profile
  useEffect(() => {
    const fetchAdmin = async () => {
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1);
      
      if (adminRoles && adminRoles.length > 0) {
        const adminUserId = adminRoles[0].user_id;
        
        // Don't show admin to themselves
        if (adminUserId === currentUserId) return;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', adminUserId)
          .single();
        
        if (profile) {
          setAdminProfile({
            ...profile,
            display_name: profile.display_name || 'Admin C Market',
            isAdmin: true
          });
        }
      }
    };

    if (currentUserId) {
      fetchAdmin();
    }
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

  // Fetch unread counts for each conversation
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!conversations || conversations.length === 0) return;

      const counts: Record<string, number> = {};
      
      for (const conv of conversations) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', currentUserId);
        
        counts[conv.id] = count || 0;
      }
      
      setUnreadCounts(counts);
    };

    fetchUnreadCounts();
  }, [conversations, currentUserId]);

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOtherUser = (conversation: any) => {
    return conversation.buyer_id === currentUserId
      ? conversation.seller
      : conversation.buyer;
  };

  const isImageUrl = (content?: string): boolean => {
    if (!content) return false;
    return content.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null || 
           content.includes('supabase.co/storage');
  };

  if (isLoading) {
    return (
      <div className="space-y-0 bg-white h-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b">
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
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white px-4 py-3 z-10">
        <h2 className="font-bold text-lg">Mesaje</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Admin Contact - Always at top */}
        {adminProfile && (
          <div
            onClick={handleAdminClick}
            className={`flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-gray-50 ${
              selectedId === 'admin-new' || (adminConversation && selectedId === adminConversation.id) 
                ? 'bg-primary/5' 
                : ''
            }`}
          >
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                <AvatarImage src={adminProfile.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                  <Shield className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full w-3.5 h-3.5 border-2 border-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                  Admin C Market
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary px-1.5 py-0">
                    Suport
                  </Badge>
                </p>
              </div>
              <p className="text-sm text-gray-500 truncate">
                💬 Întreabă orice! Suntem aici să te ajutăm.
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
            const unreadCount = unreadCounts[conversation.id] || 0;
            const userIdShort = otherUser?.user_id?.slice(0, 6)?.toUpperCase() || '------';
            
            return (
              <div
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                  isSelected ? 'bg-gray-100' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser?.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-400 text-white">
                      {getInitials(otherUser?.display_name || otherUser?.username)}
                    </AvatarFallback>
                  </Avatar>
                  {/* User ID Badge */}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                    #{userIdShort}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                        {otherUser?.display_name || otherUser?.username || 'Utilizator'}
                      </p>
                    </div>
                    <span className={`text-xs flex-shrink-0 ${unreadCount > 0 ? 'text-primary font-medium' : 'text-gray-400'}`}>
                      {formatDistanceToNow(new Date(conversation.updated_at), {
                        addSuffix: false,
                        locale: ro,
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate flex items-center gap-1 ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {isImageUrl(conversation.last_message) ? (
                        <>
                          <Image className="h-3.5 w-3.5" />
                          <span>Imagine</span>
                        </>
                      ) : (
                        conversation.listings?.title || 'Produs șters'
                      )}
                    </p>
                    
                    {unreadCount > 0 && (
                      <Badge className="bg-[#25D366] hover:bg-[#25D366] text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
