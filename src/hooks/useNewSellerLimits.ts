import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NewSellerLimits {
  maxListings: number;
  maxSaleAmount: number;
  dailyListingLimit: number;
  canWithdrawImmediately: boolean;
  accountAgeDays: number;
  totalSales: number;
  averageRating: number;
  limitLevel: 'new' | 'intermediate' | 'established' | 'trusted';
  nextLevelRequirements: string[];
}

const LIMIT_LEVELS = {
  new: {
    maxListings: 10,
    maxSaleAmount: 500,
    dailyListingLimit: 3,
    canWithdrawImmediately: false,
  },
  intermediate: {
    maxListings: 50,
    maxSaleAmount: 2000,
    dailyListingLimit: 10,
    canWithdrawImmediately: false,
  },
  established: {
    maxListings: 200,
    maxSaleAmount: 10000,
    dailyListingLimit: 25,
    canWithdrawImmediately: true,
  },
  trusted: {
    maxListings: 1000,
    maxSaleAmount: 100000,
    dailyListingLimit: 100,
    canWithdrawImmediately: true,
  },
};

export function useNewSellerLimits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['new-seller-limits', user?.id],
    queryFn: async (): Promise<NewSellerLimits> => {
      if (!user) {
        return {
          ...LIMIT_LEVELS.new,
          accountAgeDays: 0,
          totalSales: 0,
          averageRating: 0,
          limitLevel: 'new',
          nextLevelRequirements: ['Creează un cont'],
        };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('created_at, total_sales_count, average_rating, is_verified, kyc_status')
        .eq('user_id', user.id)
        .single();

      if (error || !profile) {
        return {
          ...LIMIT_LEVELS.new,
          accountAgeDays: 0,
          totalSales: 0,
          averageRating: 0,
          limitLevel: 'new',
          nextLevelRequirements: ['Completează profilul'],
        };
      }

      const accountAgeDays = Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalSales = profile.total_sales_count || 0;
      const averageRating = profile.average_rating || 0;
      const isVerified = profile.is_verified || false;
      const kycApproved = profile.kyc_status === 'approved';

      // Determine level based on criteria
      let limitLevel: NewSellerLimits['limitLevel'] = 'new';
      const nextLevelRequirements: string[] = [];

      if (kycApproved && accountAgeDays >= 90 && totalSales >= 50 && averageRating >= 4.5) {
        limitLevel = 'trusted';
      } else if (kycApproved && accountAgeDays >= 30 && totalSales >= 10 && averageRating >= 4.0) {
        limitLevel = 'established';
        if (accountAgeDays < 90) nextLevelRequirements.push(`${90 - accountAgeDays} zile până la nivel Trusted`);
        if (totalSales < 50) nextLevelRequirements.push(`${50 - totalSales} vânzări pentru Trusted`);
        if (averageRating < 4.5) nextLevelRequirements.push('Rating 4.5+ pentru Trusted');
      } else if (accountAgeDays >= 7 && totalSales >= 3 && averageRating >= 3.5) {
        limitLevel = 'intermediate';
        if (!kycApproved) nextLevelRequirements.push('Finalizează verificarea KYC');
        if (accountAgeDays < 30) nextLevelRequirements.push(`${30 - accountAgeDays} zile pentru Established`);
        if (totalSales < 10) nextLevelRequirements.push(`${10 - totalSales} vânzări pentru Established`);
      } else {
        // New seller
        if (accountAgeDays < 7) nextLevelRequirements.push(`${7 - accountAgeDays} zile pentru nivelul următor`);
        if (totalSales < 3) nextLevelRequirements.push(`${3 - totalSales} vânzări pentru nivelul următor`);
        if (averageRating < 3.5 && totalSales > 0) nextLevelRequirements.push('Rating 3.5+ necesar');
      }

      const limits = LIMIT_LEVELS[limitLevel];

      return {
        ...limits,
        accountAgeDays,
        totalSales,
        averageRating,
        limitLevel,
        nextLevelRequirements,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}
