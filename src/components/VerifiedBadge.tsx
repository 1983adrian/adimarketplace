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

      // Check if user is verified seller first (faster check)
      if (status?.is_verified) {
        return { isSpecial: true, type: 'Vânzător Verificat' };
      }

      // Top seller check is now cached more aggressively
      // This uses a separate query with longer staleTime to reduce DB load
      return { isSpecial: false, type: null };
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - increased for scalability
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
  });
};

// Separate hook for top seller check - runs less frequently
const useTopSellerStatus = (userId: string, isAlreadySpecial: boolean) => {
  return useQuery({
    queryKey: ['top-seller-badge', userId],
    queryFn: async () => {
      // Only fetch top 10 sellers once per session
      const { data: orders } = await supabase
        .from('orders')
        .select('seller_id')
        .eq('status', 'delivered')
        .limit(1000); // Limit for performance

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
          return { isTopSeller: true, rank };
        }
      }

      return { isTopSeller: false, rank: null };
    },
    enabled: !!userId && !isAlreadySpecial, // Only run if not already special
    staleTime: 30 * 60 * 1000, // 30 minutes - top sellers don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
};

const sizeClasses = {
  sm: { container: 'h-5 w-5', icon: 'h-3 w-3' },
  md: { container: 'h-6 w-6', icon: 'h-3.5 w-3.5' },
  lg: { container: 'h-8 w-8', icon: 'h-5 w-5' },
};

// Inner badge component that can receive refs - uses button for proper ref forwarding
const BadgeIcon = forwardRef<HTMLButtonElement, { size: 'sm' | 'md' | 'lg'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ size, className, ...props }, ref) => (
    <button 
      ref={ref}
      type="button"
      className={`${sizeClasses[size].container} rounded-full bg-[#1d9bf0] flex items-center justify-center shrink-0 cursor-help border-0 p-0 ${className || ''}`}
      style={{ 
        boxShadow: '0 2px 8px rgba(29, 155, 240, 0.4), 0 1px 3px rgba(0,0,0,0.3)',
      }}
      {...props}
    >
      <Check 
        className={`${sizeClasses[size].icon} text-white`} 
        strokeWidth={3.5}
      />
    </button>
  )
);
BadgeIcon.displayName = 'BadgeIcon';

export const VerifiedBadge = forwardRef<HTMLButtonElement, VerifiedBadgeProps>(({ 
  userId, 
  size = 'md',
  showTooltip = true 
}, ref) => {
  const { data: specialData } = useIsSpecialUser(userId);
  const { data: topSellerData } = useTopSellerStatus(userId, !!specialData?.isSpecial);

  // Determine final status
  let isSpecial = specialData?.isSpecial || false;
  let badgeType = specialData?.type;

  // Check top seller status if not already special
  if (!isSpecial && topSellerData?.isTopSeller) {
    isSpecial = true;
    badgeType = `Top ${topSellerData.rank} Vânzător ⭐`;
  }

  if (!isSpecial) return null;

  if (!showTooltip) {
    return <BadgeIcon ref={ref} size={size} />;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <BadgeIcon ref={ref} size={size} />
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{badgeType}</p>
      </TooltipContent>
    </Tooltip>
  );
});

VerifiedBadge.displayName = 'VerifiedBadge';

export default VerifiedBadge;
