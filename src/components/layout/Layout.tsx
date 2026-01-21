import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useRealTimeNotifications, useRealTimeOrders, useRealTimeBids } from '@/hooks/useRealTimeNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  // Activate real-time notifications for all users
  useRealTimeNotifications();
  useRealTimeOrders();
  useRealTimeBids();
  
  // Initialize native push notifications (only active on iOS/Android)
  usePushNotifications();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};
