import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProhibitedItem {
  id: string;
  keyword: string;
  category: string | null;
  severity: 'warn' | 'block' | 'flag';
  reason: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
}

// Get all prohibited items (for admin)
export const useProhibitedItems = () => {
  return useQuery({
    queryKey: ['prohibited-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prohibited_items' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ProhibitedItem[];
    },
  });
};

// Get active prohibited items (for listing validation)
export const useActiveProhibitedItems = () => {
  return useQuery({
    queryKey: ['prohibited-items-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prohibited_items' as any)
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return (data || []) as unknown as ProhibitedItem[];
    },
  });
};

// Create prohibited item (admin only)
export const useCreateProhibitedItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      keyword,
      category,
      severity,
      reason,
    }: {
      keyword: string;
      category?: string;
      severity: 'warn' | 'block' | 'flag';
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from('prohibited_items' as any)
        .insert({
          keyword,
          category: category || null,
          severity,
          reason: reason || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prohibited-items'] });
      toast({ title: 'Cuvânt interzis adăugat' });
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });
};

// Delete prohibited item (admin only)
export const useDeleteProhibitedItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('prohibited_items' as any)
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prohibited-items'] });
      toast({ title: 'Element șters' });
    },
    onError: (error: Error) => {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    },
  });
};

// Toggle prohibited item active status
export const useToggleProhibitedItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, isActive }: { itemId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('prohibited_items' as any)
        .update({ is_active: isActive })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prohibited-items'] });
    },
  });
};

// Check if listing text contains prohibited items
export const checkProhibitedContent = (
  text: string,
  prohibitedItems: ProhibitedItem[]
): { found: ProhibitedItem[]; blocked: boolean } => {
  const lowerText = text.toLowerCase();
  const found: ProhibitedItem[] = [];
  let blocked = false;

  for (const item of prohibitedItems) {
    if (lowerText.includes(item.keyword.toLowerCase())) {
      found.push(item);
      if (item.severity === 'block') {
        blocked = true;
      }
    }
  }

  return { found, blocked };
};
