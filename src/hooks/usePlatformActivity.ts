import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformActivity {
  id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  metadata: Record<string, any>;
  is_public: boolean;
  created_at: string;
}

export function usePlatformActivity(limit = 10) {
  return useQuery({
    queryKey: ['platform-activity', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_activity')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as PlatformActivity[];
    },
  });
}

export function useContentFreshness() {
  return useQuery({
    queryKey: ['content-freshness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_freshness')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}

export function usePlatformStatistics() {
  return useQuery({
    queryKey: ['platform-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_statistics')
        .select('*')
        .eq('stat_key', 'dashboard_stats')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.stat_value as Record<string, any> | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSeoIndexingQueue() {
  return useQuery({
    queryKey: ['seo-indexing-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_indexing_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useSeoKeywords() {
  return useQuery({
    queryKey: ['seo-keywords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_keywords')
        .select('*')
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}
