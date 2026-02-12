import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Extend ServiceWorkerRegistration to include pushManager
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
  }, []);

  // Save subscription to database
  const saveSubscription = useCallback(async (subscription: PushSubscription) => {
    if (!user) return;
    const keys = subscription.toJSON().keys;
    if (!keys?.p256dh || !keys?.auth) return;

    try {
      await supabase.from('web_push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,endpoint' });
    } catch (err) {
      console.error('Failed to save web push subscription:', err);
    }
  }, [user]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !user) return false;

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });

      await saveSubscription(subscription);
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Web push subscription failed:', err);
      return false;
    }
  }, [isSupported, user, saveSubscription]);

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported || !user) return;

    const checkExisting = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        if (!registration) return;

        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setIsSubscribed(true);
          // Refresh subscription in DB
          await saveSubscription(subscription);
        }
      } catch (err) {
        console.log('Could not check existing subscription:', err);
      }
    };

    checkExisting();
  }, [isSupported, user, saveSubscription]);

  // Auto-prompt for permission when user is logged in
  useEffect(() => {
    if (!isSupported || !user || isSubscribed) return;

    const permission = Notification.permission;
    if (permission === 'granted') {
      // Already granted, just subscribe silently
      subscribe();
    } else if (permission === 'default') {
      // Not yet asked - show browser prompt after short delay
      const timer = setTimeout(() => {
        subscribe();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // If 'denied', do nothing - user blocked it
  }, [isSupported, user, isSubscribed, subscribe]);

  // Remove subscription on logout
  useEffect(() => {
    if (!user && isSubscribed) {
      setIsSubscribed(false);
    }
  }, [user, isSubscribed]);

  return { isSupported, isSubscribed, subscribe };
};
