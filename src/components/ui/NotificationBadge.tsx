import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  className,
  size = 'md' 
}) => {
  if (count <= 0) return null;

  const sizeClasses = {
    sm: 'h-4 min-w-[16px] text-[9px] px-1',
    md: 'h-5 min-w-[20px] text-[10px] px-1.5',
    lg: 'h-6 min-w-[24px] text-xs px-2',
  };

  return (
    <span
      className={cn(
        'absolute flex items-center justify-center font-bold rounded-full',
        'bg-destructive text-destructive-foreground',
        'animate-pulse shadow-lg',
        sizeClasses[size],
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;
