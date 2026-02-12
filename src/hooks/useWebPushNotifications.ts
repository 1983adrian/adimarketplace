import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Extend ServiceWorkerRegistration for pushManager
declare global {
  interface ServiceWorkerRegistration {
    pushManager: PushManager;
  }
}

const VAPID_PUBLIC_KEY = 'BAcbE0CJfqFXW-me1_geAquvSmv9jMX2KKfjOFwZBEYbIhBOLb0oU4ViTgRkMrQapFTLRs8hVlkenH6KjlbnYaA';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useWebPushNotifications = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    console.log('[WebPush] Supported:', supported);
  }, []);

  // Save subscription to database
  const saveSubscription = useCallback(async (subscription: PushSubscription) => {
    if (!user) return;
    const keys = subscription.toJSON().keys;
    if (!keys?.p256dh || !keys?.auth) return;

    try {
      await (supabase as any).from('web_push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,endpoint' });
      console.log('[WebPush] Subscription saved to DB');
    } catch (err) {
      console.error('[WebPush] Failed to save subscription:', err);
    }
  }, [user]);

  // Get or register service worker
  const getServiceWorkerRegistration = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      // First check for any existing registration
      let registration = await navigator.serviceWorker.getRegistration('/');
      
      if (!registration) {
        // Try to register our sw.js
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('[WebPush] Registered new SW');
      }
      
      // Wait for it to be ready
      await navigator.serviceWorker.ready;
      console.log('[WebPush] SW is ready');
      return registration;
    } catch (err) {
      console.error('[WebPush] SW registration error:', err);
      return null;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !user) {
      console.log('[WebPush] Cannot subscribe - supported:', isSupported, 'user:', !!user);
      return false;
    }

    try {
      console.log('[WebPush] Requesting permission...');
      const permission = await Notification.requestPermission();
      console.log('[WebPush] Permission result:', permission);
      
      if (permission !== 'granted') {
        toast.error('Notificările au fost blocate. Activează-le din setările browserului.');
        return false;
      }

      const registration = await getServiceWorkerRegistration();
      if (!registration) {
        console.error('[WebPush] No SW registration available');
        return false;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });

      console.log('[WebPush] Subscribed successfully!');
      await saveSubscription(subscription);
      setIsSubscribed(true);
      toast.success('🔔 Notificările sunt activate! Vei primi alerte chiar și când browserul e închis.');
      return true;
    } catch (err) {
      console.error('[WebPush] Subscription failed:', err);
      return false;
    }
  }, [isSupported, user, saveSubscription, getServiceWorkerRegistration]);

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported || !user) return;

    const checkExisting = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        if (!registration) {
          console.log('[WebPush] No existing SW registration');
          return;
        }

        const subscription = await registration.pushManager?.getSubscription();
        if (subscription) {
          console.log('[WebPush] Found existing subscription');
          setIsSubscribed(true);
          await saveSubscription(subscription);
        } else {
          console.log('[WebPush] No existing subscription');
        }
      } catch (err) {
        console.log('[WebPush] Could not check existing subscription:', err);
      }
    };

    checkExisting();
  }, [isSupported, user, saveSubscription]);

  // Auto-prompt for permission when user is logged in
  useEffect(() => {
    if (!isSupported || !user || isSubscribed) return;

    const permission = Notification.permission;
    console.log('[WebPush] Current permission:', permission, 'User:', user.email);
    
    if (permission === 'granted') {
      subscribe();
    } else if (permission === 'default') {
      // Show a toast prompt after short delay
      const timer = setTimeout(() => {
        toast('🔔 Activează notificările', {
          description: 'Primești alerte instant pe telefon și PC, chiar și cu browserul închis.',
          action: {
            label: 'Activează',
            onClick: () => subscribe(),
          },
          duration: 15000,
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, user, isSubscribed, subscribe]);

  // Remove subscription on logout
  useEffect(() => {
    if (!user && isSubscribed) {
      setIsSubscribed(false);
    }
  }, [user, isSubscribed]);

  return { isSupported, isSubscribed, subscribe };
};
