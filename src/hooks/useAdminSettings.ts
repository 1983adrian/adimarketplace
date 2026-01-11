import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Platform Settings
export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');
      
      if (error) throw error;
      
      // Convert array to object keyed by 'key'
      const settings: Record<string, any> = {};
      data?.forEach(item => {
        settings[item.key] = item.value;
      });
      return settings;
    },
  });
}

export function useUpdatePlatformSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category?: string }) => {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ key, value, category: category || 'general', updated_at: new Date().toISOString() }, { onConflict: 'key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({ title: 'Setting saved' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// Homepage Content
export function useHomepageContent() {
  return useQuery({
    queryKey: ['homepage-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateHomepageContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (content: {
      id?: string;
      section_key: string;
      title?: string;
      subtitle?: string;
      description?: string;
      image_url?: string;
      button_text?: string;
      button_url?: string;
      is_active?: boolean;
      sort_order?: number;
    }) => {
      if (content.id) {
        const { error } = await supabase
          .from('homepage_content')
          .update({ ...content, updated_at: new Date().toISOString() })
          .eq('id', content.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('homepage_content')
          .upsert({ ...content }, { onConflict: 'section_key' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-content'] });
      toast({ title: 'Homepage content saved' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// SEO Settings
export function useSeoSettings() {
  return useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateSeoSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (setting: {
      page_key: string;
      meta_title?: string;
      meta_description?: string;
      og_title?: string;
      og_description?: string;
      og_image?: string;
      keywords?: string[];
    }) => {
      const { error } = await supabase
        .from('seo_settings')
        .upsert({ ...setting, updated_at: new Date().toISOString() }, { onConflict: 'page_key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({ title: 'SEO settings saved' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// Email Templates
export function useEmailTemplates() {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: {
      template_key: string;
      name: string;
      subject: string;
      body_html: string;
      body_text?: string;
      variables?: string[];
      is_active?: boolean;
    }) => {
      const { error } = await supabase
        .from('email_templates')
        .upsert({ ...template, updated_at: new Date().toISOString() }, { onConflict: 'template_key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({ title: 'Email template saved' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// Policies Content
export function usePoliciesContent() {
  return useQuery({
    queryKey: ['policies-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policies_content')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (policy: {
      policy_key: string;
      title: string;
      content: string;
      version?: string;
      is_published?: boolean;
    }) => {
      const { error } = await supabase
        .from('policies_content')
        .upsert({ 
          ...policy, 
          updated_at: new Date().toISOString(),
          published_at: policy.is_published ? new Date().toISOString() : null
        }, { onConflict: 'policy_key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies-content'] });
      toast({ title: 'Policy saved' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

// Audit Logs
export function useAuditLogs(filters?: { category?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('entity_type', filters.category);
      }
      
      if (filters?.search) {
        query = query.or(`action.ilike.%${filters.search}%,entity_id.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: {
      action: string;
      entity_type: string;
      entity_id?: string;
      old_values?: any;
      new_values?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          admin_id: user.id,
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          old_values: log.old_values,
          new_values: log.new_values,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}
