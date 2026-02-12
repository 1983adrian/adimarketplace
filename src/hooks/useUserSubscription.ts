import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SellerPlan {
  id: string;
  plan_type: string;
  plan_name: string;
  price_ron: number;
  max_listings: number | null;
  is_auction_plan: boolean;
  description: string;
  icon: string;
}

export const SELLER_PLANS: SellerPlan[] = [
  {
    id: 'start',
    plan_type: 'start',
    plan_name: 'Plan START',
    price_ron: 11,
    max_listings: 10,
    is_auction_plan: false,
    description: 'Maxim 10 listări/unități în total pe cont',
    icon: '🟢',
  },
  {
    id: 'licitatii',
    plan_type: 'licitatii',
    plan_name: 'Plan LICITAȚII',
    price_ron: 11,
    max_listings: 10,
    is_auction_plan: true,
    description: 'Maxim 10 listări/unități scoase la licitație',
    icon: '🔨',
  },
  {
    id: 'silver',
    plan_type: 'silver',
    plan_name: 'Plan SILVER',
    price_ron: 50,
    max_listings: 50,
    is_auction_plan: false,
    description: 'Maxim 50 listări/unități în total pe cont',
    icon: '🥈',
  },
  {
    id: 'gold',
    plan_type: 'gold',
    plan_name: 'Plan GOLD',
    price_ron: 150,
    max_listings: 150,
    is_auction_plan: false,
    description: 'Maxim 150 listări/unități în total pe cont',
    icon: '🥇',
  },
  {
    id: 'platinum',
    plan_type: 'platinum',
    plan_name: 'Plan PLATINUM',
    price_ron: 499,
    max_listings: 500,
    is_auction_plan: false,
    description: 'Maxim 500 listări/unități în total pe cont',
    icon: '💎',
  },
  {
    id: 'vip',
    plan_type: 'vip',
    plan_name: 'Plan VIP',
    price_ron: 999,
    max_listings: null,
    is_auction_plan: false,
    description: 'NELIMITAT la numărul de listări. Tot maxim 3 poze per listare.',
    icon: '👑',
  },
];

export const BIDDER_PLAN = {
  id: 'bidder',
  plan_type: 'bidder',
  plan_name: 'Abonament LICITATOR',
  price_ron: 11,
  max_listings: 10,
  is_auction_plan: false,
  description: '10 listări incluse + acces la licitații',
  icon: '🎯',
};

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  plan_name: string;
  price_ron: number;
  max_listings: number | null;
  is_auction_plan: boolean;
  status: string;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
}

// Get active seller plan
export const useActiveSellerPlan = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-seller-plan', user?.id],
    queryFn: async (): Promise<UserSubscription | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .neq('plan_type', 'bidder')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as UserSubscription | null;
    },
    enabled: !!user,
  });
};

// Get active bidder subscription
export const useActiveBidderPlan = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-bidder-plan', user?.id],
    queryFn: async (): Promise<UserSubscription | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('plan_type', 'bidder')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as UserSubscription | null;
    },
    enabled: !!user,
  });
};

// Get all user subscriptions
export const useUserSubscriptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserSubscription[];
    },
    enabled: !!user,
  });
};

// Subscribe to a plan
export const useSubscribeToPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: SellerPlan | typeof BIDDER_PLAN) => {
      if (!user) throw new Error('Trebuie să fii autentificat');

      // Check if user already has an active plan of this type
      const isBidder = plan.plan_type === 'bidder';
      
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('plan_type', plan.plan_type)
        .maybeSingle();

      if (existing) {
        throw new Error(`Ai deja un ${plan.plan_name} activ!`);
      }

      // If subscribing to a seller plan (not bidder), cancel existing seller plans
      if (!isBidder) {
        await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('user_id', user.id)
          .eq('status', 'active')
          .neq('plan_type', 'bidder');
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_type: plan.plan_type,
          plan_name: plan.plan_name,
          price_ron: plan.price_ron,
          max_listings: 'max_listings' in plan ? plan.max_listings : null,
          is_auction_plan: 'is_auction_plan' in plan ? plan.is_auction_plan : false,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Update max_listings in profiles if plan has listings
      if ('max_listings' in plan && plan.max_listings) {
        await supabase
          .from('profiles')
          .update({ max_listings: plan.max_listings })
          .eq('user_id', user.id);
      }

      return data;
    },
    onSuccess: (_, plan) => {
      queryClient.invalidateQueries({ queryKey: ['active-seller-plan'] });
      queryClient.invalidateQueries({ queryKey: ['active-bidder-plan'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['listing-limit'] });
      toast({
        title: `${plan.plan_name} activat! ✅`,
        description: `Planul tău a fost activat cu succes.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
