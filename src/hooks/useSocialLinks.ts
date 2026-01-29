import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ['social-links'],
    queryFn: async (): Promise<SocialLinks> => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'social')
        .single();
      
      if (error) {
        // Return empty object if no settings found
        if (error.code === 'PGRST116') {
          return {};
        }
        throw error;
      }
      
      return (data?.value as SocialLinks) || {};
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
