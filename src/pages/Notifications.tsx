import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, MessageCircle, Star, CreditCard, Truck, Check, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications, useMarkNotificationRead, useMarkAllRead, Notification } from '@/hooks/useRealTimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const notificationIcons: Record<string, React.ReactNode> = {
  order: <Package className="h-5 w-5 text-blue-500" />,
  new_order: <Package className="h-5 w-5 text-green-500" />,
  order_confirmed: <Package className="h-5 w-5 text-emerald-500" />,
  message: <MessageCircle className="h-5 w-5 text-green-500" />,
  review: <Star className="h-5 w-5 text-yellow-500" />,
  payout: <CreditCard className="h-5 w-5 text-purple-500" />,
  shipping: <Truck className="h-5 w-5 text-orange-500" />,
  info: <Bell className="h-5 w-5 text-blue-400" />,
  verification_submitted: <Check className="h-5 w-5 text-cyan-500" />,
};

const Notifications: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }

    // Navigate based on notification type
    const type = notification.type as string;
    if (type === 'order' || type === 'new_order' || type === 'order_confirmed' || type === 'shipping') {
      navigate('/orders');
    } else if (type === 'message') {
      navigate('/messages');
    } else if (type === 'review') {
      navigate('/dashboard');
    } else if (type === 'payout') {
      navigate('/settings?tab=payouts');
    }
    // For other types (info, verification_submitted), stay on page
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge notificarea",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      toast({
        title: "Șters",
        description: "Notificarea a fost ștearsă",
      });
    }
  };

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Notificări</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} necitite</Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Marchează toate citite
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Toate Notificările
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications && notifications.length > 0 ? (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all hover:bg-muted/80 ${
                        !notification.is_read ? 'bg-primary/5 border-l-4 border-primary' : 'bg-muted/30'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mt-0.5 p-2 rounded-full bg-background">
                        {notificationIcons[notification.type] || <Bell className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true,
                            locale: ro 
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">Nicio notificare</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vei primi notificări despre comenzi, mesaje și actualizări aici.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;
