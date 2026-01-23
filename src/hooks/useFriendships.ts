import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
  requester?: {
    user_id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    store_name: string | null;
    is_verified: boolean | null;
  };
  addressee?: {
    user_id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    store_name: string | null;
    is_verified: boolean | null;
  };
}

// Get all friends (accepted friendships)
export const useFriends = (userId?: string) => {
  return useQuery({
    queryKey: ['friends', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // First get the friendships
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!friendships || friendships.length === 0) return [];

      // Get unique user IDs
      const userIds = new Set<string>();
      friendships.forEach(f => {
        userIds.add(f.requester_id);
        userIds.add(f.addressee_id);
      });

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, store_name, is_verified')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Attach profiles to friendships
      return friendships.map(f => ({
        ...f,
        requester: profileMap.get(f.requester_id),
        addressee: profileMap.get(f.addressee_id),
      })) as Friendship[];
    },
    enabled: !!userId,
  });
};

// Get pending friend requests (received)
export const usePendingFriendRequests = (userId?: string) => {
  return useQuery({
    queryKey: ['friend-requests', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!friendships || friendships.length === 0) return [];

      // Get requester profiles
      const requesterIds = friendships.map(f => f.requester_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, store_name, is_verified')
        .in('user_id', requesterIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return friendships.map(f => ({
        ...f,
        requester: profileMap.get(f.requester_id),
      })) as Friendship[];
    },
    enabled: !!userId,
  });
};

// Get sent friend requests
export const useSentFriendRequests = (userId?: string) => {
  return useQuery({
    queryKey: ['sent-friend-requests', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!friendships || friendships.length === 0) return [];

      // Get addressee profiles
      const addresseeIds = friendships.map(f => f.addressee_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, store_name, is_verified')
        .in('user_id', addresseeIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return friendships.map(f => ({
        ...f,
        addressee: profileMap.get(f.addressee_id),
      })) as Friendship[];
    },
    enabled: !!userId,
  });
};

// Check friendship status between two users
export const useFriendshipStatus = (userId?: string, otherUserId?: string) => {
  return useQuery({
    queryKey: ['friendship-status', userId, otherUserId],
    queryFn: async () => {
      if (!userId || !otherUserId) return null;
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${userId},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${userId})`)
        .maybeSingle();

      if (error) throw error;
      return data as Friendship | null;
    },
    enabled: !!userId && !!otherUserId,
  });
};

// Send friend request
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requesterId, addresseeId }: { requesterId: string; addresseeId: string }) => {
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sent-friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status', variables.requesterId, variables.addresseeId] });
      toast.success('Cerere de prietenie trimisă!');
    },
    onError: (error: any) => {
      if (error?.code === '23505') {
        toast.error('Cererea de prietenie există deja');
      } else {
        toast.error('Nu s-a putut trimite cererea');
      }
    }
  });
};

// Accept friend request
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status'] });
      toast.success('Cerere acceptată! Sunteți acum prieteni.');
    },
    onError: () => {
      toast.error('Nu s-a putut accepta cererea');
    }
  });
};

// Reject/Cancel friend request
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sent-friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status'] });
      toast.success('Cerere anulată');
    },
    onError: () => {
      toast.error('Nu s-a putut anula cererea');
    }
  });
};

// Remove friend
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendship-status'] });
      toast.success('Prieten șters');
    },
    onError: () => {
      toast.error('Nu s-a putut șterge prietenul');
    }
  });
};
