import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing, ListingWithImages, ItemCondition } from '@/types/database';

interface ListingFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 40;

export const useListings = (filters?: ListingFilters) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const pageSize = filters?.pageSize || DEFAULT_PAGE_SIZE;
      const page = filters?.page || 0;
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('listings')
        .select(`
          *,
          listing_images (*),
          categories (*)
        `, { count: 'exact' })
        .eq('is_active', true)
        .eq('is_sold', false);

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      switch (filters?.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const listings = data as unknown as ListingWithImages[];
      
      // Filter out listings from blocked sellers
      if (listings.length > 0) {
        const sellerIds = [...new Set(listings.map(l => l.seller_id))];
        const { data: blockedSellers } = await supabase
          .from('profiles')
          .select('user_id')
          .in('user_id', sellerIds)
          .eq('is_listing_blocked', true);
        
        if (blockedSellers && blockedSellers.length > 0) {
          const blockedIds = new Set(blockedSellers.map(s => s.user_id));
          return {
            listings: listings.filter(l => !blockedIds.has(l.seller_id)),
            totalCount: (count || 0),
            page,
            pageSize,
          };
        }
      }

      return { listings, totalCount: count || 0, page, pageSize };
    },
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`*, listing_images (*), categories (*)`)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ListingWithImages | null;
    },
    enabled: !!id,
  });
};

export const useMyListings = (userId?: string) => {
  return useQuery({
    queryKey: ['my-listings', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('listings')
        .select(`*, listing_images (*), categories (*)`)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as unknown as ListingWithImages[];
    },
    enabled: !!userId,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'views_count'>) => {
      const { data, error } = await supabase.from('listings').insert(listing).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Listing> & { id: string }) => {
      const { data, error } = await supabase.from('listings').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};
