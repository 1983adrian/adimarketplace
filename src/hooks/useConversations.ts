import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, ConversationWithDetails } from '@/types/database';

export const useConversations = (userId?: string) => {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('[useConversations] Fetching for userId:', userId);
      
      // Fetch conversations with related data
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listings (
            *,
            listing_images (*)
          )
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('updated_at', { ascending: false });
      
      console.log('[useConversations] Result:', { conversations, error });
      
      if (error) {
        console.error('[useConversations] Error:', error);
        throw error;
      }
      if (!conversations || conversations.length === 0) return [];
      
      // Get all unique user IDs from conversations
      const userIds = new Set<string>();
      conversations.forEach(conv => {
        userIds.add(conv.buyer_id);
        userIds.add(conv.seller_id);
      });
      
      // Fetch all profiles using secure public view (only safe columns)
      const { data: profiles } = await supabase
        .from('public_seller_profiles')
        .select('*')
        .in('user_id', Array.from(userIds));
      
      // Create profile lookup map
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      // Attach buyer and seller profiles to each conversation
      const enrichedConversations = conversations.map(conv => ({
        ...conv,
        buyer: profileMap.get(conv.buyer_id) || null,
        seller: profileMap.get(conv.seller_id) || null,
      }));
      
      return enrichedConversations;
    },
    enabled: !!userId,
  });
};

export const useConversation = (conversationId?: string) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      
      // Fetch conversation with listing
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listings (*)
        `)
        .eq('id', conversationId)
        .maybeSingle();
      
      if (error) throw error;
      if (!conversation) return null;
      
      // Fetch buyer and seller profiles using secure public view
      const { data: profiles } = await supabase
        .from('public_seller_profiles')
        .select('*')
        .in('user_id', [conversation.buyer_id, conversation.seller_id]);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return {
        ...conversation,
        buyer: profileMap.get(conversation.buyer_id) || null,
        seller: profileMap.get(conversation.seller_id) || null,
      };
    },
    enabled: !!conversationId,
  });
};

export const useMessages = (conversationId?: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
    staleTime: 1000, // 1 second cache to prevent excessive refetches
    refetchOnWindowFocus: false,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ listingId, buyerId, sellerId }: { listingId: string; buyerId: string; sellerId: string }) => {
      // Check if conversation already exists for this listing between buyer and seller
      const { data: existing, error: existingError } = await supabase
        .from('conversations')
        .select('*')
        .eq('listing_id', listingId)
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .maybeSingle();
      
      if (existingError) throw existingError;
      
      if (existing) {
        return existing;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({ 
          listing_id: listingId, 
          buyer_id: buyerId, 
          seller_id: sellerId 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, senderId, content }: { conversationId: string; senderId: string; content: string }) => {
      // First verify the conversation exists and user is participant
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id, buyer_id, seller_id')
        .eq('id', conversationId)
        .single();
      
      if (convError) {
        console.error('Conversation not found:', convError);
        throw new Error('Conversația nu a fost găsită');
      }
      
      // Check if user is participant
      if (conversation.buyer_id !== senderId && conversation.seller_id !== senderId) {
        throw new Error('Nu ai permisiunea să trimiți mesaje în această conversație');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({ 
          conversation_id: conversationId, 
          sender_id: senderId, 
          content,
          is_read: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    }
  });
};

export const useMarkMessagesRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId }: { conversationId: string }) => {
      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);
      
      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};
