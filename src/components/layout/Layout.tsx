import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

import { AppDownloadBar } from './AppDownloadBar';
import { GrandOpeningBanner } from '@/components/announcements/GrandOpeningBanner';
import { useRealTimeNotifications, useRealTimeOrders, useRealTimeBids, useGlobalMessageNotifications, useRealTimeFriendRequests, useRealTimeReturns, useRealTimeDisputes, useTrackingReminder } from '@/hooks/useRealTimeNotifications';
import { useAdminRealTimeNotifications } from '@/hooks/useAdminRealTimeNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';
import { useAppBadge } from '@/hooks/useAppBadge';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  // Activate real-time notifications for all users
  useRealTimeNotifications();
  useRealTimeOrders();
  useRealTimeBids();
  useGlobalMessageNotifications(); // Global message notifications
  useRealTimeFriendRequests();
  useRealTimeReturns();
  useRealTimeDisputes();
  useTrackingReminder();
  
  // Admin-only: listen to ALL platform events (orders, disputes, returns, reports, fraud)
  useAdminRealTimeNotifications();
  
  // Initialize native push notifications (only active on iOS/Android)
  usePushNotifications();
  
  // Initialize Web Push notifications (PWA/browser - for phone notification bar)
  useWebPushNotifications();
  
  // Update app icon badge with unread count (native + PWA)
  useAppBadge();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Grand Opening Banner - positioned below header, visible until April 29, 2026 */}
      <GrandOpeningBanner />
      <AppDownloadBar />
      <main className="flex-1">{children}</main>
      {!hideFooter && (
        <Footer />
      )}
    </div>
  );
};
