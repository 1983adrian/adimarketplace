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
import { usePlatformSettings } from '@/hooks/useAdminSettings';
import { useIsAdmin } from '@/hooks/useAdmin';
import { AlertTriangle, Clock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const MaintenancePage = ({ settings }: { settings: Record<string, any> }) => {
  const title = (settings?.maintenance_title as string) || 'Revenim în curând!';
  const message = (settings?.maintenance_message as string) || 'Platforma este în mentenanță programată.';
  const endTime = settings?.maintenance_end_time as string;
  const showCountdown = settings?.maintenance_show_countdown !== false;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
          <AlertTriangle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-lg">{message}</p>
        {endTime && showCountdown && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Revenim la: {new Date(endTime).toLocaleString('ro-RO')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  // Activate real-time notifications for all users
  useRealTimeNotifications();
  useRealTimeOrders();
  useRealTimeBids();
  useGlobalMessageNotifications();
  useRealTimeFriendRequests();
  useRealTimeReturns();
  useRealTimeDisputes();
  useTrackingReminder();
  
  // Admin-only: listen to ALL platform events
  useAdminRealTimeNotifications();
  
  // Initialize push notifications
  usePushNotifications();
  useWebPushNotifications();
  useAppBadge();

  // Check maintenance mode
  const { data: platformSettings } = usePlatformSettings();
  const { data: isAdmin } = useIsAdmin();

  const isMaintenanceMode = platformSettings?.maintenance_mode === true || platformSettings?.maintenance_mode === 'true';
  const allowAdminAccess = platformSettings?.maintenance_allow_admin !== false;

  // Show maintenance page for non-admin users when maintenance is active
  if (isMaintenanceMode && !(isAdmin && allowAdminAccess)) {
    return <MaintenancePage settings={platformSettings || {}} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <GrandOpeningBanner />
      <AppDownloadBar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};