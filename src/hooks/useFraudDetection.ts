import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FraudCheckResult {
  success: boolean;
  alerts_created: number;
  alerts: {
    type: string;
    severity: string;
    title: string;
    auto_action: string | null;
  }[];
}

export function useFraudCheck() {
  return useMutation({
    mutationFn: async ({
      action,
      userId,
      listingId,
      ipAddress,
    }: {
      action: 'check_user' | 'check_listing' | 'check_withdrawal' | 'scan_platform';
      userId?: string;
      listingId?: string;
      ipAddress?: string;
    }): Promise<FraudCheckResult> => {
      const { data, error } = await supabase.functions.invoke('fraud-detection', {
        body: {
          action,
          user_id: userId,
          listing_id: listingId,
          ip_address: ipAddress,
        },
      });

      if (error) throw error;
      return data;
    },
  });
}

export function useCheckListingFraud() {
  const fraudCheck = useFraudCheck();

  return async (listingId: string): Promise<boolean> => {
    try {
      const result = await fraudCheck.mutateAsync({
        action: 'check_listing',
        listingId,
      });
      return result.alerts_created === 0;
    } catch {
      // If fraud check fails, allow listing (fail open for UX)
      console.warn('Fraud check failed, allowing listing');
      return true;
    }
  };
}

export function useCheckWithdrawalFraud() {
  const fraudCheck = useFraudCheck();

  return async (userId: string): Promise<{ allowed: boolean; message?: string }> => {
    try {
      const result = await fraudCheck.mutateAsync({
        action: 'check_withdrawal',
        userId,
      });

      if (result.alerts_created > 0) {
        const criticalAlert = result.alerts.find(a => a.severity === 'critical');
        return {
          allowed: false,
          message: criticalAlert?.title || 'Activitate suspectă detectată',
        };
      }

      return { allowed: true };
    } catch {
      // If fraud check fails, block withdrawal (fail closed for security)
      return { allowed: false, message: 'Verificarea de securitate a eșuat' };
    }
  };
}
