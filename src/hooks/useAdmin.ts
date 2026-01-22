import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Admin email - recognized by system
const ADMIN_EMAIL = 'adrianchirita01@gmail.com';

export const useIsAdmin = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-admin', user?.id, user?.email],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Check by email first (primary method for owner)
      if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return true;
      }
      
      // Fallback: check user_roles table
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return data === true;
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch roles separately
      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);
      
      return profiles.map(p => ({
        ...p,
        user_roles: roles?.filter(r => r.user_id === p.user_id) || []
      }));
    },
  });
};

export const useAllListings = () => {
  return useQuery({
    queryKey: ['admin-listings'],
    queryFn: async () => {
      const { data: listings, error } = await supabase
        .from('listings')
        .select(`
          *,
          categories:category_id (name),
          listing_images (image_url, is_primary)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch seller profiles separately
      const sellerIds = [...new Set(listings.map(l => l.seller_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', sellerIds);
      
      return listings.map(l => ({
        ...l,
        profiles: profiles?.find(p => p.user_id === l.seller_id)
      }));
    },
  });
};

export const useAllOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          listings:listing_id (
            id,
            title, 
            price,
            listing_images (image_url, is_primary)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch buyer and seller profiles
      const buyerIds = [...new Set(data.map(o => o.buyer_id))];
      const sellerIds = [...new Set(data.map(o => o.seller_id))];
      const allUserIds = [...new Set([...buyerIds, ...sellerIds])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', allUserIds);

      return data.map(order => ({
        ...order,
        buyer_profile: profiles?.find(p => p.user_id === order.buyer_id),
        seller_profile: profiles?.find(p => p.user_id === order.seller_id),
      }));
    },
  });
};

export const usePlatformFees = () => {
  return useQuery({
    queryKey: ['platform-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_fees')
        .select('*')
        .eq('is_active', true)
        .order('fee_type');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdatePlatformFee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, amount, description, is_active }: { id: string; amount: number; description?: string; is_active?: boolean }) => {
      const updateData: Record<string, any> = { 
        amount, 
        description, 
        updated_at: new Date().toISOString() 
      };
      
      if (typeof is_active === 'boolean') {
        updateData.is_active = is_active;
      }
      
      const { error } = await supabase
        .from('platform_fees')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-fees'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'moderator' | 'user' }) => {
      // First check if user already has a role
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (existing) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useUpdateListingStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('listings')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    },
  });
};

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalListings },
        { count: activeListings },
        { count: totalOrders },
        { data: paidOrders },
        { data: sellerSubs },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('amount').eq('status', 'paid'),
        supabase.from('seller_subscriptions').select('*').eq('status', 'active'),
      ]);
      
      const totalRevenue = paidOrders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
      
      return {
        totalUsers: totalUsers || 0,
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        activeSellers: sellerSubs?.length || 0,
      };
    },
    refetchInterval: 30000,
  });
};

export const useAllConversations = () => {
  return useQuery({
    queryKey: ['admin-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (id, content, created_at, sender_id),
          listings:listing_id (title)
        `)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};
