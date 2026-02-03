import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type BadgeType = 'owner' | 'admin' | 'moderator' | 'top_seller' | 'verified' | null;

const OWNER_EMAIL = 'adrianchirita01@gmail.com';

export const useVerifiedBadge = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['verified-badge', userId],
    queryFn: async (): Promise<BadgeType> => {
      if (!userId) return null;

      // Check if user is owner (by email)
      const { data: authData } = await supabase.auth.admin.listUsers?.() || { data: null };
      
      // Check user roles (admin/moderator)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleData?.role === 'admin') return 'admin';
      if (roleData?.role === 'moderator') return 'moderator';

      // Check if in top 10 sellers
      const { data: topSellers } = await supabase
        .from('orders')
        .select('seller_id')
        .eq('status', 'delivered');

      if (topSellers) {
        // Count sales per seller
        const salesCount: Record<string, number> = {};
        topSellers.forEach(order => {
          salesCount[order.seller_id] = (salesCount[order.seller_id] || 0) + 1;
        });

        // Get top 10 seller IDs
        const sortedSellers = Object.entries(salesCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([id]) => id);

        if (sortedSellers.includes(userId)) {
          return 'top_seller';
        }
      }

      // Check if verified seller
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('user_id', userId)
        .single();

      if (profile?.is_verified) return 'verified';

      return null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useTopSellers = () => {
  return useQuery({
    queryKey: ['top-sellers'],
    queryFn: async (): Promise<string[]> => {
      const { data: orders } = await supabase
        .from('orders')
        .select('seller_id')
        .eq('status', 'delivered');

      if (!orders) return [];

      // Count sales per seller
      const salesCount: Record<string, number> = {};
      orders.forEach(order => {
        salesCount[order.seller_id] = (salesCount[order.seller_id] || 0) + 1;
      });

      // Get top 10 seller IDs
      return Object.entries(salesCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useIsSpecialUser = (userId: string | undefined) => {
  const { data: topSellers } = useTopSellers();
  
  return useQuery({
    queryKey: ['is-special-user', userId, topSellers],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false;

      // Check user roles (admin/moderator)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleData?.role === 'admin' || roleData?.role === 'moderator') {
        return true;
      }

      // Check if in top 10 sellers
      if (topSellers?.includes(userId)) {
        return true;
      }

      return false;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};
