import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Hook for counting unread/pending items on dashboard buttons

export const useDashboardBadges = () => {
  const { user } = useAuth();

  // Pending purchases (orders as buyer - pending/paid/shipped status)
  const { data: pendingPurchases = 0 } = useQuery({
    queryKey: ['dashboard-badge-purchases', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .in('status', ['pending', 'paid', 'shipped']);
      
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
  });

  // Pending sales (orders as seller - pending/paid status needing action)
  const { data: pendingSales = 0 } = useQuery({
    queryKey: ['dashboard-badge-sales', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .in('status', ['pending', 'paid']); // Need to add tracking
      
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
  });

  // My returns (returns as buyer - pending status)
  const { data: myPendingReturns = 0 } = useQuery({
    queryKey: ['dashboard-badge-my-returns', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('returns')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .in('status', ['pending', 'approved']);
      
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
  });

  // Received returns (returns as seller - pending status needing action)
  const { data: receivedPendingReturns = 0 } = useQuery({
    queryKey: ['dashboard-badge-received-returns', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('returns')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'pending'); // Needs seller approval
      
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
  });

  return {
    pendingPurchases,
    pendingSales,
    myPendingReturns,
    receivedPendingReturns,
  };
};

export default useDashboardBadges;
