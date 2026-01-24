import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface SellerStats {
  average_rating: number;
  total_reviews: number;
  total_sales: number;
  member_since: string;
}

export const useSellerReviews = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-reviews', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      
      // First get reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewed_user_id', sellerId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      if (!reviews || reviews.length === 0) return [];

      // Get reviewer profiles
      const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', reviewerIds);

      // Combine data
      return reviews.map(review => ({
        ...review,
        reviewer_profile: profiles?.find(p => p.user_id === review.reviewer_id) || undefined,
      })) as Review[];
    },
    enabled: !!sellerId,
  });
};

export const useSellerStats = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-stats', sellerId],
    queryFn: async (): Promise<SellerStats | null> => {
      if (!sellerId) return null;

      // Get profile for member since date
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', sellerId)
        .single();

      // Get reviews for rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_user_id', sellerId);

      // Get completed sales count
      const { count: salesCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .eq('status', 'delivered');

      const ratings = reviews?.map(r => r.rating) || [];
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      return {
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: reviews?.length || 0,
        total_sales: salesCount || 0,
        member_since: profile?.created_at || new Date().toISOString(),
      };
    },
    enabled: !!sellerId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      orderId,
      reviewedUserId,
      rating,
      comment,
    }: {
      orderId: string;
      reviewedUserId: string;
      rating: number;
      comment?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          order_id: orderId,
          reviewer_id: user.id,
          reviewed_user_id: reviewedUserId,
          rating,
          comment: comment || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller-reviews', variables.reviewedUserId] });
      queryClient.invalidateQueries({ queryKey: ['seller-stats', variables.reviewedUserId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCanReview = (orderId: string | undefined, sellerId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can-review', orderId, user?.id],
    queryFn: async () => {
      if (!orderId || !user) return false;

      // Check if order exists and is delivered
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('buyer_id', user.id)
        .eq('status', 'delivered')
        .single();

      if (!order) return false;

      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', orderId)
        .eq('reviewer_id', user.id)
        .single();

      return !existingReview;
    },
    enabled: !!orderId && !!user,
  });
};

// Hook to get seller rating for listing cards (lightweight version)
export const useSellerRating = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ['seller-rating', sellerId],
    queryFn: async (): Promise<{ average: number; count: number }> => {
      if (!sellerId) return { average: 0, count: 0 };

      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_user_id', sellerId);

      if (!reviews || reviews.length === 0) {
        return { average: 0, count: 0 };
      }

      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      return {
        average: Math.round((sum / reviews.length) * 10) / 10,
        count: reviews.length,
      };
    },
    enabled: !!sellerId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
