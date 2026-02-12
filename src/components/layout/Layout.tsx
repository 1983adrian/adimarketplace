import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { InstallBanner } from './InstallBanner';
import { GrandOpeningBanner } from '@/components/announcements/GrandOpeningBanner';
import { useRealTimeNotifications, useRealTimeOrders, useRealTimeBids, useGlobalMessageNotifications, useRealTimeFriendRequests, useRealTimeReturns, useRealTimeDisputes, useTrackingReminder } from '@/hooks/useRealTimeNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
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
  
  // Initialize native push notifications (only active on iOS/Android)
  usePushNotifications();
  
  // Update app icon badge with unread count (native + PWA)
  useAppBadge();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Grand Opening Banner - positioned below header, visible until April 29, 2026 */}
      <GrandOpeningBanner />
      <main className="flex-1">{children}</main>
      {!hideFooter && (
        <Footer />
      )}
      
      {/* PWA Install Banner for mobile users */}
      <InstallBanner />
    </div>
  );
};
