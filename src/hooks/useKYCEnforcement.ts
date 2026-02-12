import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KYCStatus {
  isVerified: boolean;
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  hasBankDetails: boolean;
  hasAddress: boolean;
  canSell: boolean;
  canWithdraw: boolean;
  missingFields: string[];
  message: string;
}

export function useKYCEnforcement() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: async (): Promise<KYCStatus> => {
      if (!user) {
        return {
          isVerified: false,
          kycStatus: 'not_started',
          hasBankDetails: false,
          hasAddress: false,
          canSell: false,
          canWithdraw: false,
          missingFields: ['login'],
          message: 'Trebuie să fii autentificat',
        };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          paypal_email,
          is_seller,
          is_suspended,
          is_verified,
          withdrawal_blocked
        `)
        .eq('user_id', user.id)
        .single();

      if (error || !profile) {
        return {
          isVerified: false,
          kycStatus: 'not_started',
          hasBankDetails: false,
          hasAddress: false,
          canSell: false,
          canWithdraw: false,
          missingFields: ['profile'],
          message: 'Profilul nu a fost găsit',
        };
      }

      const missingFields: string[] = [];

      // PayPal is the only payment method - check if configured
      const hasPayPal = !!profile.paypal_email;
      if (!hasPayPal) {
        missingFields.push('email PayPal');
      }

      // With PayPal model, KYC is handled by PayPal directly
      const isVerified = profile.is_verified || false;
      const canSell = profile.is_seller === true && !profile.is_suspended;
      const canWithdraw = hasPayPal && !profile.withdrawal_blocked && !profile.is_suspended;

      let message = '';
      if (profile.is_suspended) {
        message = 'Contul tău este suspendat. Contactează suportul.';
      } else if (profile.withdrawal_blocked) {
        message = 'Extragerea fondurilor este temporar blocată.';
      } else if (!hasPayPal) {
        message = 'Adaugă email-ul PayPal pentru a primi plăți.';
      } else if (isVerified) {
        message = 'Contul tău este verificat complet.';
      } else {
        message = 'Contul PayPal este configurat.';
      }

      return {
        isVerified,
        kycStatus: isVerified ? 'approved' : hasPayPal ? 'pending' : 'not_started',
        hasBankDetails: hasPayPal,
        hasAddress: true, // Addresses managed in saved_addresses table
        canSell,
        canWithdraw,
        missingFields,
        message,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRequireKYC() {
  const { data: kycStatus, isLoading } = useKYCEnforcement();

  return {
    isLoading,
    canSell: kycStatus?.canSell || false,
    canWithdraw: kycStatus?.canWithdraw || false,
    kycStatus: kycStatus?.kycStatus || 'not_started',
    message: kycStatus?.message || '',
    missingFields: kycStatus?.missingFields || [],
  };
}
