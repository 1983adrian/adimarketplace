import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPayload {
  type: 'sms' | 'email';
  to: string;
  message: string;
  subject?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderConfirmation: boolean;
  shippingUpdates: boolean;
  adminAlerts: boolean;
}

// Fetch notification settings from database
const fetchNotificationSettings = async (): Promise<NotificationSettings> => {
  const defaultSettings: NotificationSettings = {
    emailNotifications: true,
    orderConfirmation: true,
    shippingUpdates: true,
    adminAlerts: true,
  };

  try {
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
  } catch {
    return defaultSettings;
  }
};

export const useSendNotification = () => {
  return useMutation({
    mutationFn: async (payload: NotificationPayload) => {
      // Check if notifications are globally enabled
      const settings = await fetchNotificationSettings();
      
      if (!settings.emailNotifications && payload.type === 'email') {
        console.log('Email notifications are disabled in platform settings');
        return { skipped: true, reason: 'Email notifications disabled' };
      }

      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: payload,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
};

// Utility function to send order notification to seller
export const sendOrderNotificationToSeller = async (
  sellerPhone: string,
  sellerEmail: string,
  orderDetails: {
    itemTitle: string;
    buyerName: string;
    amount: number;
  }
) => {
  // Check platform notification settings first
  const settings = await fetchNotificationSettings();
  
  if (!settings.emailNotifications) {
    console.log('All email notifications are disabled');
    return [{ type: 'email', skipped: true, reason: 'Notifications disabled' }];
  }

  if (!settings.orderConfirmation) {
    console.log('Order confirmation notifications are disabled');
    return [{ type: 'email', skipped: true, reason: 'Order confirmations disabled' }];
  }

  const smsMessage = `🎉 Comandă nouă pe C.Market! "${orderDetails.itemTitle}" a fost cumpărat de ${orderDetails.buyerName} pentru £${orderDetails.amount}. Verifică dashboard-ul pentru detalii.`;
  
  const emailMessage = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">🎉 Ai o comandă nouă!</h1>
      <p>Felicitări! Cineva tocmai a cumpărat produsul tău pe C.Market.</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Produs:</strong> ${orderDetails.itemTitle}</p>
        <p style="margin: 4px 0;"><strong>Cumpărător:</strong> ${orderDetails.buyerName}</p>
        <p style="margin: 4px 0;"><strong>Suma:</strong> £${orderDetails.amount}</p>
      </div>
      <p>Accesează dashboard-ul pentru a procesa comanda și a marca expedierea.</p>
      <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://adimarketplace.lovable.app'}/dashboard" 
         style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
        Vezi Comanda
      </a>
    </div>
  `;

  const results = [];

  // Send SMS if phone is available
  if (sellerPhone) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'sms',
          to: sellerPhone,
          message: smsMessage,
        },
      });
      results.push({ type: 'sms', success: !error, data, error });
    } catch (e) {
      results.push({ type: 'sms', success: false, error: e });
    }
  }

  // Send email if available
  if (sellerEmail) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'email',
          to: sellerEmail,
          subject: `🎉 Comandă nouă: ${orderDetails.itemTitle}`,
          message: emailMessage,
        },
      });
      results.push({ type: 'email', success: !error, data, error });
    } catch (e) {
      results.push({ type: 'email', success: false, error: e });
    }
  }

  return results;
};

// Utility function to send shipping notification to buyer
export const sendShippingNotificationToBuyer = async (
  buyerPhone: string,
  buyerEmail: string,
  orderDetails: {
    itemTitle: string;
    trackingNumber?: string;
    carrier?: string;
  }
) => {
  // Check platform notification settings first
  const settings = await fetchNotificationSettings();
  
  if (!settings.emailNotifications) {
    console.log('All email notifications are disabled');
    return [{ type: 'email', skipped: true, reason: 'Notifications disabled' }];
  }

  if (!settings.shippingUpdates) {
    console.log('Shipping update notifications are disabled');
    return [{ type: 'email', skipped: true, reason: 'Shipping updates disabled' }];
  }

  const smsMessage = `📦 Comanda ta a fost expediată! "${orderDetails.itemTitle}" este pe drum. ${orderDetails.trackingNumber ? `Tracking: ${orderDetails.trackingNumber}` : ''}`;
  
  const emailMessage = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">📦 Comanda ta a fost expediată!</h1>
      <p>Vești bune! Produsul tău este pe drum.</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Produs:</strong> ${orderDetails.itemTitle}</p>
        ${orderDetails.carrier ? `<p style="margin: 4px 0;"><strong>Curier:</strong> ${orderDetails.carrier}</p>` : ''}
        ${orderDetails.trackingNumber ? `<p style="margin: 4px 0;"><strong>Număr tracking:</strong> ${orderDetails.trackingNumber}</p>` : ''}
      </div>
      <p>Poți urmări statusul comenzii în dashboard.</p>
    </div>
  `;

  const results = [];

  if (buyerPhone) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'sms',
          to: buyerPhone,
          message: smsMessage,
        },
      });
      results.push({ type: 'sms', success: !error, data, error });
    } catch (e) {
      results.push({ type: 'sms', success: false, error: e });
    }
  }

  if (buyerEmail) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'email',
          to: buyerEmail,
          subject: `📦 Comanda ta a fost expediată: ${orderDetails.itemTitle}`,
          message: emailMessage,
        },
      });
      results.push({ type: 'email', success: !error, data, error });
    } catch (e) {
      results.push({ type: 'email', success: false, error: e });
    }
  }

  return results;
};

// Send admin alert notification
export const sendAdminAlert = async (
  adminEmail: string,
  alertDetails: {
    title: string;
    message: string;
    type: 'order' | 'dispute' | 'security' | 'system';
  }
) => {
  // Check if admin alerts are enabled
  const settings = await fetchNotificationSettings();
  
  if (!settings.adminAlerts) {
    console.log('Admin alerts are disabled in platform settings');
    return { skipped: true, reason: 'Admin alerts disabled' };
  }

  const emailMessage = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ef4444;">⚠️ ${alertDetails.title}</h1>
      <p>${alertDetails.message}</p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Acest mesaj a fost trimis automat de sistemul C.Market.
      </p>
    </div>
  `;

  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        type: 'email',
        to: adminEmail,
        subject: `⚠️ Alertă Admin: ${alertDetails.title}`,
        message: emailMessage,
      },
    });
    
    return { success: !error, data, error };
  } catch (e) {
    return { success: false, error: e };
  }
};
