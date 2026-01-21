import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
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

const sizeClasses = {
  sm: { container: 'h-5 w-5', icon: 'h-3 w-3' },
  md: { container: 'h-6 w-6', icon: 'h-3.5 w-3.5' },
  lg: { container: 'h-8 w-8', icon: 'h-5 w-5' },
};

// Inner badge component that can receive refs
const BadgeIcon = forwardRef<HTMLDivElement, { size: 'sm' | 'md' | 'lg'; className?: string }>(
  ({ size, className, ...props }, ref) => (
    <div 
      ref={ref}
      className={`${sizeClasses[size].container} rounded-full bg-[#1d9bf0] flex items-center justify-center shrink-0 cursor-help ${className || ''}`}
      style={{ 
        boxShadow: '0 2px 8px rgba(29, 155, 240, 0.4), 0 1px 3px rgba(0,0,0,0.3)',
      }}
      {...props}
    >
      <Check 
        className={`${sizeClasses[size].icon} text-white`} 
        strokeWidth={3.5}
      />
    </div>
  )
);
BadgeIcon.displayName = 'BadgeIcon';

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  userId, 
  size = 'md',
  showTooltip = true 
}) => {
  const { data } = useIsSpecialUser(userId);

  if (!data?.isSpecial) return null;

  if (!showTooltip) {
    return <BadgeIcon size={size} />;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <BadgeIcon size={size} />
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{data.type}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default VerifiedBadge;
