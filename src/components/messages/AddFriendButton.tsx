import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Clock, UserMinus } from 'lucide-react';
import { useFriendshipStatus, useSendFriendRequest, useRejectFriendRequest, useAcceptFriendRequest } from '@/hooks/useFriendships';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AddFriendButtonProps {
  targetUserId: string;
  variant?: 'default' | 'icon' | 'compact';
  className?: string;
}

export const AddFriendButton: React.FC<AddFriendButtonProps> = ({ 
  targetUserId, 
  variant = 'default',
  className 
}) => {
  const { user } = useAuth();
  const { data: friendshipStatus, isLoading } = useFriendshipStatus(user?.id, targetUserId);
  const sendRequest = useSendFriendRequest();
  const cancelRequest = useRejectFriendRequest();
  const acceptRequest = useAcceptFriendRequest();

  if (!user || user.id === targetUserId) return null;

  const handleClick = () => {
    if (!friendshipStatus) {
      // No relationship - send request
      sendRequest.mutate({ requesterId: user.id, addresseeId: targetUserId });
    } else if (friendshipStatus.status === 'pending') {
      if (friendshipStatus.requester_id === user.id) {
        // I sent the request - cancel it
        cancelRequest.mutate(friendshipStatus.id);
      } else {
        // They sent me a request - accept it
        acceptRequest.mutate(friendshipStatus.id);
      }
    } else if (friendshipStatus.status === 'accepted') {
      // Already friends - remove
      cancelRequest.mutate(friendshipStatus.id);
    }
  };

  const isPending = sendRequest.isPending || cancelRequest.isPending || acceptRequest.isPending;

  const getButtonState = () => {
    if (!friendshipStatus) {
      return { icon: UserPlus, label: 'Adaugă prieten', variant: 'default' as const };
    }
    
    if (friendshipStatus.status === 'pending') {
      if (friendshipStatus.requester_id === user.id) {
        return { icon: Clock, label: 'Cerere trimisă', variant: 'secondary' as const };
      }
      return { icon: UserCheck, label: 'Acceptă', variant: 'default' as const };
    }
    
    if (friendshipStatus.status === 'accepted') {
      return { icon: UserMinus, label: 'Prieten', variant: 'outline' as const };
    }
    
    return { icon: UserPlus, label: 'Adaugă prieten', variant: 'default' as const };
  };

  const state = getButtonState();
  const Icon = state.icon;

  if (isLoading) {
    return (
      <Button variant="ghost" size={variant === 'icon' ? 'icon' : 'sm'} disabled className={className}>
        <UserPlus className="h-4 w-4 animate-pulse" />
      </Button>
    );
  }

  if (variant === 'icon') {
    return (
      <Button
        size="icon"
        variant={state.variant}
        onClick={handleClick}
        disabled={isPending}
        className={cn("h-8 w-8", className)}
        title={state.label}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        size="sm"
        variant={state.variant}
        onClick={handleClick}
        disabled={isPending}
        className={cn("h-8 gap-1.5", className)}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{state.label}</span>
      </Button>
    );
  }

  return (
    <Button
      variant={state.variant}
      onClick={handleClick}
      disabled={isPending}
      className={cn("gap-2", className)}
    >
      <Icon className="h-4 w-4" />
      {state.label}
    </Button>
  );
};
