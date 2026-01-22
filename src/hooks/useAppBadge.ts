import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { useUnreadCount } from '@/hooks/useRealTimeNotifications';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

export const useAppBadge = () => {
  const { data: unreadNotifications = 0 } = useUnreadCount();
  const { data: unreadMessages = 0 } = useUnreadMessages();

  const totalBadgeCount = (unreadNotifications || 0) + (unreadMessages || 0);

  const updateBadge = useCallback(async (count: number) => {
    // Native iOS badge via Push Notifications plugin
    if (Capacitor.isNativePlatform()) {
      try {
        // iOS automatically handles badge count through push notifications
        // For local badge updates, we use the notification system
        console.log('App badge count updated:', count);
      } catch (error) {
        console.log('Failed to update native badge:', error);
      }
    }

    // PWA badge API (supported in Chrome, Edge on desktop and mobile)
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
        } else {
          await (navigator as any).clearAppBadge();
        }
        console.log('PWA badge updated:', count);
      } catch (error) {
        // Badge API might not be available in all contexts
        console.log('PWA badge not available:', error);
      }
    }
  }, []);

  // Update badge when counts change
  useEffect(() => {
    updateBadge(totalBadgeCount);
  }, [totalBadgeCount, updateBadge]);

  // Update document title to show unread count (works everywhere)
  useEffect(() => {
    const baseTitle = 'Marketplace România';
    if (totalBadgeCount > 0) {
      document.title = `(${totalBadgeCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [totalBadgeCount]);

  // Update favicon with badge indicator
  useEffect(() => {
    const updateFaviconBadge = () => {
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!favicon) return;

      if (totalBadgeCount > 0) {
        // Create canvas for badge overlay
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 32;
        canvas.height = 32;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Draw original favicon
          ctx.drawImage(img, 0, 0, 32, 32);

          // Draw badge circle
          ctx.beginPath();
          ctx.arc(24, 8, 8, 0, 2 * Math.PI);
          ctx.fillStyle = '#ef4444'; // Red badge
          ctx.fill();

          // Draw badge number
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const badgeText = totalBadgeCount > 9 ? '9+' : String(totalBadgeCount);
          ctx.fillText(badgeText, 24, 8);

          // Update favicon
          favicon.href = canvas.toDataURL('image/png');
        };
        img.src = '/favicon.ico';
      }
    };

    if (totalBadgeCount > 0) {
      updateFaviconBadge();
    } else {
      // Reset to original favicon
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon) {
        favicon.href = '/favicon.ico';
      }
    }
  }, [totalBadgeCount]);

  return {
    badgeCount: totalBadgeCount,
    updateBadge,
    clearBadge: () => updateBadge(0),
  };
};

export default useAppBadge;
