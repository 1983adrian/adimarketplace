import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  emailNotifications: boolean;
  orderConfirmation: boolean;
  shippingUpdates: boolean;
  adminAlerts: boolean;
}

const defaultSettings: NotificationSettings = {
  emailNotifications: true,
  orderConfirmation: true,
  shippingUpdates: true,
  adminAlerts: true,
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'notifications')
        .single();

      if (error || !data) {
        console.log('Using default notification settings');
        return defaultSettings;
      }

      return {
        ...defaultSettings,
        ...(data.value as Partial<NotificationSettings>),
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Helper function to check notification settings (for edge functions)
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'notifications')
      .single();

    if (error || !data) {
      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...(data.value as Partial<NotificationSettings>),
    };
  } catch {
    return defaultSettings;
  }
};
