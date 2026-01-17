import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavedAddress {
  id: string;
  user_id: string;
  label: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useSavedAddresses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-addresses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedAddress[];
    },
    enabled: !!user,
  });
};

export const useDefaultAddress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['default-address', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_default', true)
        .maybeSingle();

      if (error) throw error;
      return data as SavedAddress | null;
    },
    enabled: !!user,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (address: Omit<SavedAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Trebuie să fii autentificat');

      // If this is set as default, remove default from others
      if (address.is_default) {
        await supabase
          .from('saved_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('saved_addresses')
        .insert({
          ...address,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['default-address'] });
      toast({
        title: 'Adresă salvată',
        description: 'Adresa a fost adăugată cu succes.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...address }: Partial<SavedAddress> & { id: string }) => {
      if (!user) throw new Error('Trebuie să fii autentificat');

      // If setting as default, remove default from others
      if (address.is_default) {
        await supabase
          .from('saved_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('saved_addresses')
        .update({
          ...address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['default-address'] });
      toast({
        title: 'Adresă actualizată',
        description: 'Adresa a fost modificată cu succes.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (addressId: string) => {
      if (!user) throw new Error('Trebuie să fii autentificat');

      const { error } = await supabase
        .from('saved_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['default-address'] });
      toast({
        title: 'Adresă ștearsă',
        description: 'Adresa a fost eliminată.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
