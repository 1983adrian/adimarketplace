import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPayload {
  type: 'sms' | 'email';
  to: string;
  message: string;
  subject?: string;
}

export const useSendNotification = () => {
  return useMutation({
    mutationFn: async (payload: NotificationPayload) => {
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
  const smsMessage = `🎉 Comandă nouă pe MarketPlace! "${orderDetails.itemTitle}" a fost cumpărat de ${orderDetails.buyerName} pentru £${orderDetails.amount}. Verifică dashboard-ul pentru detalii.`;
  
  const emailMessage = `
    <h1>🎉 Ai o comandă nouă!</h1>
    <p>Felicitări! Cineva tocmai a cumpărat produsul tău.</p>
    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p><strong>Produs:</strong> ${orderDetails.itemTitle}</p>
      <p><strong>Cumpărător:</strong> ${orderDetails.buyerName}</p>
      <p><strong>Suma:</strong> £${orderDetails.amount}</p>
    </div>
    <p>Accesează dashboard-ul pentru a procesa comanda și a marca expedierea.</p>
    <a href="https://marketplace.lovable.app/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Vezi Comanda</a>
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
  const smsMessage = `📦 Comanda ta a fost expediată! "${orderDetails.itemTitle}" este pe drum. ${orderDetails.trackingNumber ? `Tracking: ${orderDetails.trackingNumber}` : ''}`;
  
  const emailMessage = `
    <h1>📦 Comanda ta a fost expediată!</h1>
    <p>Vești bune! Produsul tău este pe drum.</p>
    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p><strong>Produs:</strong> ${orderDetails.itemTitle}</p>
      ${orderDetails.carrier ? `<p><strong>Curier:</strong> ${orderDetails.carrier}</p>` : ''}
      ${orderDetails.trackingNumber ? `<p><strong>Număr tracking:</strong> ${orderDetails.trackingNumber}</p>` : ''}
    </div>
    <p>Poți urmări statusul comenzii în dashboard.</p>
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
