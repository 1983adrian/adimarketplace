import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSellerCountry = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['seller-country', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('country')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data?.country || null;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateSellerCountry = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (country: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({ country })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-country', user?.id] });
    },
  });
};

// Check if seller is from Romania (eligible for COD)
export const useIsRomanianSeller = () => {
  const { data: country, isLoading } = useSellerCountry();
  
  const isRomanian = country?.toLowerCase() === 'romania' || 
                     country?.toLowerCase() === 'ro' ||
                     country?.toLowerCase() === 'românia';
  
  return { isRomanian, isLoading, country };
};
