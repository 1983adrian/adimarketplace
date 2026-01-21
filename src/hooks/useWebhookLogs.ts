import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WebhookLog {
  id: string;
  processor: string;
  event_type: string;
  resource_id: string | null;
  payload: any;
  processed: boolean;
  processed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export function useWebhookLogs(processor?: string) {
  return useQuery({
    queryKey: ['webhook-logs', processor],
    queryFn: async () => {
      let query = supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (processor) {
        query = query.eq('processor', processor);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as WebhookLog[];
    },
  });
}

export function useWebhookStats() {
  return useQuery({
    queryKey: ['webhook-stats'],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from('webhook_logs')
        .select('processor, processed, event_type')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const stats = {
        total: logs?.length || 0,
        processed: logs?.filter(l => l.processed).length || 0,
        failed: logs?.filter(l => !l.processed).length || 0,
        byProcessor: {} as Record<string, number>,
        byEventType: {} as Record<string, number>,
      };

      logs?.forEach(log => {
        stats.byProcessor[log.processor] = (stats.byProcessor[log.processor] || 0) + 1;
        stats.byEventType[log.event_type] = (stats.byEventType[log.event_type] || 0) + 1;
      });

      return stats;
    },
  });
}
