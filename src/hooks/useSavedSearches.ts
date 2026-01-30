import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  query: string;
  filters: Record<string, any>;
  notify_on_new: boolean;
  last_notified_at: string | null;
  created_at: string;
}

export const useSavedSearches = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-searches', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_searches' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as SavedSearch[];
    },
    enabled: !!user,
  });
};

export const useCreateSavedSearch = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      name,
      query,
      filters,
      notifyOnNew,
    }: {
      name: string;
      query: string;
      filters: Record<string, any>;
      notifyOnNew: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('saved_searches' as any)
        .insert({
          user_id: user.id,
          name,
          query,
          filters,
          notify_on_new: notifyOnNew,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast({ title: 'Căutare salvată!', description: 'Vei primi notificări când apar produse noi.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteSavedSearch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (searchId: string) => {
      const { error } = await supabase
        .from('saved_searches' as any)
        .delete()
        .eq('id', searchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast({ title: 'Căutare ștearsă' });
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });
};

export const useToggleSearchNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ searchId, notifyOnNew }: { searchId: string; notifyOnNew: boolean }) => {
      const { error } = await supabase
        .from('saved_searches' as any)
        .update({ notify_on_new: notifyOnNew })
        .eq('id', searchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
};
