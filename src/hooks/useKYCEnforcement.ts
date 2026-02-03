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
          kyc_status,
          kyc_documents_submitted,
          kyc_verified_at,
          address_line1,
          city,
          postal_code,
          country_of_residence,
          iban,
          account_number,
          sort_code,
          payout_method,
          mangopay_user_id,
          mangopay_wallet_id,
          is_suspended,
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

      // Check address
      const hasAddress = !!(profile.address_line1 && profile.city && profile.postal_code);
      if (!hasAddress) {
        missingFields.push('adresa');
      }

      // Check bank details
      const hasBankDetails = !!(
        (profile.iban) || 
        (profile.account_number && profile.sort_code)
      );
      if (!hasBankDetails) {
        missingFields.push('cont bancar');
      }

      // Check KYC status
      const kycStatus = (profile.kyc_status as any) || 'not_started';
      const isVerified = kycStatus === 'approved' && !!profile.kyc_verified_at;

      if (!profile.kyc_documents_submitted) {
        missingFields.push('documente KYC');
      }

      // Determine if user can sell (must have at least submitted KYC)
      const canSell = profile.kyc_documents_submitted === true && !profile.is_suspended;

      // Can withdraw only if fully verified
      const canWithdraw = isVerified && hasBankDetails && !profile.withdrawal_blocked && !profile.is_suspended;

      let message = '';
      if (profile.is_suspended) {
        message = 'Contul tău este suspendat. Contactează suportul.';
      } else if (profile.withdrawal_blocked) {
        message = 'Extragerea fondurilor este temporar blocată.';
      } else if (!profile.kyc_documents_submitted) {
        message = 'Completează verificarea KYC pentru a putea vinde.';
      } else if (kycStatus === 'pending') {
        message = 'Verificarea KYC este în curs de procesare.';
      } else if (kycStatus === 'rejected') {
        message = 'Verificarea KYC a fost respinsă. Te rugăm să retrimiti documentele.';
      } else if (!hasBankDetails) {
        message = 'Adaugă un cont bancar pentru a primi plăți.';
      } else if (isVerified) {
        message = 'Contul tău este verificat complet.';
      }

      return {
        isVerified,
        kycStatus,
        hasBankDetails,
        hasAddress,
        canSell,
        canWithdraw,
        missingFields,
        message,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
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
