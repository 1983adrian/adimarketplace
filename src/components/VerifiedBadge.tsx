import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const useIsSpecialUser = (userId: string) => {
  return useQuery({
    queryKey: ['special-user-badge', userId],
    queryFn: async () => {
      // Use the RPC function to check user status (bypasses RLS)
      const { data: statusData, error: statusError } = await supabase
        .rpc('get_user_special_status', { check_user_id: userId });

      if (statusError) {
        console.error('Error fetching user status:', statusError);
        return { isSpecial: false, type: null };
      }

      // Type assertion for the response
      const status = statusData as { is_admin: boolean; is_moderator: boolean; is_verified: boolean } | null;

      if (status?.is_admin) {
        return { isSpecial: true, type: 'Admin ✓' };
      }
      if (status?.is_moderator) {
        return { isSpecial: true, type: 'Moderator ✓' };
      }

      // Check if in top 10 sellers
      const { data: orders } = await supabase
        .from('orders')
        .select('seller_id')
        .eq('status', 'delivered');

      if (orders && orders.length > 0) {
        const salesCount: Record<string, number> = {};
        orders.forEach(order => {
          salesCount[order.seller_id] = (salesCount[order.seller_id] || 0) + 1;
        });

        const sortedSellers = Object.entries(salesCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([id]) => id);

        if (sortedSellers.includes(userId)) {
          const rank = sortedSellers.indexOf(userId) + 1;
          return { isSpecial: true, type: `Top ${rank} Vânzător ⭐` };
        }
      }

      // Check if user is verified seller
      if (status?.is_verified) {
        return { isSpecial: true, type: 'Vânzător Verificat' };
      }

      return { isSpecial: false, type: null };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  userId, 
  size = 'md',
  showTooltip = true 
}) => {
  const { data } = useIsSpecialUser(userId);

  if (!data?.isSpecial) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const badge = (
    <BadgeCheck 
      className={`${sizeClasses[size]} text-blue-500 fill-blue-500 shrink-0 drop-shadow-lg`} 
    />
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help">
          {badge}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{data.type}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default VerifiedBadge;
