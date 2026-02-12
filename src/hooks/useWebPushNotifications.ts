import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Capacitor } from '@capacitor/core';

/**
 * Web Push Notifications hook.
 * Registers the browser for push notifications using VAPID keys.
 * Works in PWA and modern browsers — no native build needed.
 * Stores the subscription endpoint in push_tokens table (platform='web').
 */

// VAPID public key — must match the one in Supabase secrets
const VAPID_PUBLIC_KEY = 'BNFVsOWru5sMpERkqrfdGs1e9NGJwqjgpGHetRMhb-QHPbrnMPeB9m8aQHh3FdQGPWHEsoISnxMHJxal8nYEEks';

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
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Don't run on native platforms (they use Capacitor push)
  const isNative = Capacitor.isNativePlatform();

  const subscribe = useCallback(async () => {
    if (isNative || !user) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermission('unsupported');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const pushManager = (registration as any).pushManager;

      // Check existing subscription
      let subscription = await pushManager.getSubscription();

      if (!subscription) {
        subscription = await pushManager.subscribe({
          userVisuallyOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      // Store subscription in push_tokens table
      const subscriptionJSON = JSON.stringify(subscription.toJSON());
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabase.from('push_tokens').upsert({
        user_id: user.id,
        token: subscriptionJSON,
        platform: 'web',
        expires_at: expiresAt.toISOString(),
        is_valid: true,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,token',
      });

      setIsSubscribed(true);
      console.log('Web Push subscribed successfully');
    } catch (err) {
      console.warn('Web Push subscription failed:', err);
    }
  }, [user, isNative]);

  // Auto-subscribe when user is logged in
  useEffect(() => {
    if (!user || isNative) return;
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);

    // Auto-subscribe if already granted
    if (Notification.permission === 'granted') {
      subscribe();
    }
  }, [user, isNative, subscribe]);

  return {
    permission,
    isSubscribed,
    subscribe,
    isSupported: !isNative && 'PushManager' in (typeof window !== 'undefined' ? window : {}),
  };
};
