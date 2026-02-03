import React, { forwardRef } from 'react';
import { Bell, FileCheck, FileX, CreditCard, AlertTriangle, BadgeCheck, Clock, Check, Megaphone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface SellerNotification {
  id: string;
  user_id: string;
  type: 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected' | 'payment_received' | 'payment_pending' | 'subscription_reminder' | 'subscription_due' | 'payout' | 'announcement' | 'important' | 'info' | 'kyc_update';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

const notificationIcons: Record<string, React.ReactNode> = {
  kyc_submitted: <FileCheck className="h-4 w-4 text-blue-500" />,
  kyc_approved: <BadgeCheck className="h-4 w-4 text-green-500" />,
  kyc_rejected: <FileX className="h-4 w-4 text-red-500" />,
  payment_received: <CreditCard className="h-4 w-4 text-green-500" />,
  payment_pending: <Clock className="h-4 w-4 text-amber-500" />,
  subscription_reminder: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  subscription_due: <CreditCard className="h-4 w-4 text-red-500" />,
  payout: <CreditCard className="h-4 w-4 text-purple-500" />,
  announcement: <Megaphone className="h-4 w-4 text-blue-500" />,
  important: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  info: <Info className="h-4 w-4 text-green-500" />,
  kyc_update: <FileCheck className="h-4 w-4 text-cyan-500" />,
};

// ForwardRef wrapper component for DropdownMenuTrigger compatibility
const TriggerButton = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  (props, ref) => (
    <Button ref={ref} {...props} />
  )
);
TriggerButton.displayName = 'TriggerButton';

const useSellerNotifications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['seller-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['kyc_submitted', 'kyc_approved', 'kyc_rejected', 'payment_received', 'payment_pending', 'subscription_reminder', 'subscription_due', 'payout', 'announcement', 'important', 'info', 'kyc_update'])
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return (data || []) as SellerNotification[];
    },
    enabled: !!user?.id,
  });
};

const useSellerUnreadCount = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['seller-notifications-unread', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .in('type', ['kyc_submitted', 'kyc_approved', 'kyc_rejected', 'payment_received', 'payment_pending', 'subscription_reminder', 'subscription_due', 'payout', 'announcement', 'important', 'info', 'kyc_update']);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });
};

const useMarkSellerNotificationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['seller-notifications-unread', user?.id] });
    },
  });
};

const useMarkAllSellerNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .in('type', ['kyc_submitted', 'kyc_approved', 'kyc_rejected', 'payment_received', 'payment_pending', 'subscription_reminder', 'subscription_due', 'payout', 'announcement', 'important', 'info', 'kyc_update']);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['seller-notifications-unread', user?.id] });
    },
  });
};

export const SellerNotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useSellerNotifications();
  const { data: unreadCount = 0 } = useSellerUnreadCount();
  const markRead = useMarkSellerNotificationRead();
  const markAllRead = useMarkAllSellerNotificationsRead();

  const handleNotificationClick = (notification: SellerNotification) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'kyc_submitted':
      case 'kyc_approved':
      case 'kyc_rejected':
        navigate('/settings?tab=payouts');
        break;
      case 'payment_received':
      case 'payment_pending':
      case 'payout':
        navigate('/settings?tab=payouts');
        break;
      case 'subscription_reminder':
      case 'subscription_due':
        navigate('/dashboard');
        break;
      default:
        navigate('/settings?tab=payouts');
    }
  };

  const getNotificationIcon = (type: string) => {
    return notificationIcons[type] || <Bell className="h-4 w-4 text-primary" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TriggerButton variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </TriggerButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 shadow-xl border-border bg-popover z-[100]">
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="font-semibold">Notificări Importante</span>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-1 text-xs hover:bg-primary/10"
              onClick={() => markAllRead.mutate()}
            >
              <Check className="h-3 w-3 mr-1" />
              Citite
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Se încarcă...
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="py-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5 p-1.5 rounded-full bg-muted">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.is_read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ro })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 mt-1 animate-pulse" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-8 w-8 opacity-40" />
              </div>
              <p className="font-medium">Nicio notificare</p>
              <p className="text-xs mt-1">
                Vei primi aici alerte despre acte, plăți și abonament
              </p>
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/settings?tab=payouts')}
          >
            Vezi toate setările de plată →
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
