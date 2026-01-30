import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformHealthCheck {
  id: string;
  check_type: string;
  status: 'ok' | 'warning' | 'error';
  last_check_at: string;
  next_check_at: string | null;
  details: Record<string, any>;
  created_at: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, any>;
  created_at: string;
}

// Hook for platform health status
export const usePlatformHealth = () => {
  return useQuery({
    queryKey: ['platform-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_health')
        .select('*')
        .order('last_check_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as PlatformHealthCheck[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

// Hook to log security events from client
export const useLogSecurityEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      eventType, 
      details 
    }: { 
      eventType: string; 
      details?: Record<string, any>;
    }) => {
      // Use RPC to log security event securely
      const { error } = await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_details: details || {},
      });

      if (error) {
        console.error('Failed to log security event:', error);
        // Don't throw - security logging shouldn't break user flows
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
    },
  });
};

// Hook for admin to view security events
export const useSecurityEvents = (limit = 50) => {
  return useQuery({
    queryKey: ['security-events', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SecurityEvent[];
    },
    staleTime: 1000 * 30, // 30 seconds cache
  });
};

// Platform statistics for footer/trust signals
export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      // Get counts from various tables
      const [listingsResult, usersResult, ordersResult] = await Promise.all([
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
      ]);

      return {
        activeListings: listingsResult.count || 0,
        totalUsers: usersResult.count || 0,
        completedOrders: ordersResult.count || 0,
        lastUpdated: new Date().toISOString(),
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
};

// Security check for suspicious activity detection
export const useSecurityCheck = () => {
  const logEvent = useLogSecurityEvent();

  const checkAndLog = async (eventType: string, details?: Record<string, any>) => {
    // Log the event
    logEvent.mutate({ eventType, details });
  };

  return { checkAndLog };
};
