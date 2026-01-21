import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  error: string | null;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    error: null,
  });

  // Check if push notifications are supported (native platform only)
  const isNativePlatform = Capacitor.isNativePlatform();

  // Save token to database
  const saveTokenToDatabase = useCallback(async (token: string) => {
    if (!user) return;

    try {
      // Upsert the push token for this user
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token: token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,token'
        });

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (err) {
      console.error('Failed to save push token:', err);
    }
  }, [user]);

  // Request permission and register for push notifications
  const registerPushNotifications = useCallback(async () => {
    if (!isNativePlatform) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Push notifications are only available on native mobile apps',
      }));
      return;
    }

    try {
      // Check current permission status
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        // Request permission
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        setState(prev => ({
          ...prev,
          isSupported: true,
          error: 'Push notification permission denied',
        }));
        return;
      }

      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();

      setState(prev => ({
        ...prev,
        isSupported: true,
        isRegistered: true,
        error: null,
      }));
    } catch (err) {
      console.error('Error registering push notifications:', err);
      setState(prev => ({
        ...prev,
        isSupported: true,
        error: 'Failed to register for push notifications',
      }));
    }
  }, [isNativePlatform]);

  // Handle notification navigation
  const handleNotificationAction = useCallback((data: Record<string, any>) => {
    const notificationType = data?.type;
    
    switch (notificationType) {
      case 'order':
        navigate('/orders');
        break;
      case 'message':
        if (data?.conversation_id) {
          navigate(`/messages?conversation=${data.conversation_id}`);
        } else {
          navigate('/messages');
        }
        break;
      case 'bid':
        if (data?.listing_id) {
          navigate(`/listing/${data.listing_id}`);
        }
        break;
      case 'shipping':
        navigate('/orders');
        break;
      case 'payout':
        navigate('/dashboard');
        break;
      default:
        navigate('/');
    }
  }, [navigate]);

  // Setup push notification listeners
  useEffect(() => {
    if (!isNativePlatform || !user) return;

    // On registration success, get the token
    const tokenListener = PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token:', token.value);
      setState(prev => ({
        ...prev,
        token: token.value,
        isRegistered: true,
      }));
      saveTokenToDatabase(token.value);
    });

    // On registration error
    const errorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
      setState(prev => ({
        ...prev,
        error: 'Registration failed: ' + error.error,
      }));
    });

    // When a push notification is received while app is in foreground
    const receivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        
        // Show in-app toast when notification arrives in foreground
        toast({
          title: notification.title || 'Notificare',
          description: notification.body || '',
        });
      }
    );

    // When user taps on a push notification
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push notification action performed:', action);
        
        const data = action.notification.data;
        handleNotificationAction(data);
      }
    );

    // Register for push notifications
    registerPushNotifications();

    // Cleanup listeners on unmount
    return () => {
      tokenListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      receivedListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [isNativePlatform, user, toast, registerPushNotifications, saveTokenToDatabase, handleNotificationAction]);

  // Remove token on logout
  useEffect(() => {
    if (!user && state.token) {
      // User logged out, optionally remove token from database
      const removeToken = async () => {
        try {
          await supabase
            .from('push_tokens')
            .delete()
            .eq('token', state.token);
        } catch (err) {
          console.error('Error removing push token:', err);
        }
      };
      removeToken();
      setState(prev => ({ ...prev, token: null, isRegistered: false }));
    }
  }, [user, state.token]);

  return {
    ...state,
    registerPushNotifications,
    isNativePlatform,
  };
};
