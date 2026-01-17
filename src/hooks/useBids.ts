import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Bid {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount: number;
  is_winning: boolean;
  created_at: string;
  bidder_profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export const useListingBids = (listingId: string) => {
  return useQuery({
    queryKey: ['bids', listingId],
    queryFn: async () => {
      const { data: bids, error } = await supabase
        .from('bids')
        .select('*')
        .eq('listing_id', listingId)
        .order('amount', { ascending: false });

      if (error) throw error;

      // Fetch bidder profiles
      if (bids && bids.length > 0) {
        const bidderIds = [...new Set(bids.map(b => b.bidder_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, username, avatar_url')
          .in('user_id', bidderIds);

        return bids.map(bid => ({
          ...bid,
          bidder_profile: profiles?.find(p => p.user_id === bid.bidder_id),
        })) as Bid[];
      }

      return bids as Bid[];
    },
    enabled: !!listingId,
  });
};

export const useHighestBid = (listingId: string) => {
  return useQuery({
    queryKey: ['highest-bid', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('listing_id', listingId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Bid | null;
    },
    enabled: !!listingId,
  });
};

export const useMyBids = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-bids', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          listings (
            id,
            title,
            auction_end_date,
            listing_images (image_url, is_primary)
          )
        `)
        .eq('bidder_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const usePlaceBid = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      listingId,
      amount,
    }: {
      listingId: string;
      amount: number;
    }) => {
      if (!user) throw new Error('Trebuie să fii autentificat');

      // Check if bid is higher than current highest
      const { data: highestBid } = await supabase
        .from('bids')
        .select('amount')
        .eq('listing_id', listingId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (highestBid && amount <= highestBid.amount) {
        throw new Error(`Licitația ta trebuie să fie mai mare de £${highestBid.amount}`);
      }

      // Check listing details
      const { data: listing } = await supabase
        .from('listings')
        .select('starting_bid, auction_end_date, seller_id')
        .eq('id', listingId)
        .single();

      if (!listing) throw new Error('Produsul nu a fost găsit');
      
      if (listing.seller_id === user.id) {
        throw new Error('Nu poți licita la propriul tău produs');
      }

      if (listing.auction_end_date && new Date(listing.auction_end_date) < new Date()) {
        throw new Error('Această licitație s-a încheiat');
      }

      if (listing.starting_bid && amount < listing.starting_bid && !highestBid) {
        throw new Error(`Licitația minimă este £${listing.starting_bid}`);
      }

      // Place the bid
      const { data, error } = await supabase
        .from('bids')
        .insert({
          listing_id: listingId,
          bidder_id: user.id,
          amount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bids', variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ['highest-bid', variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ['my-bids'] });
      toast({
        title: 'Licitație plasată!',
        description: 'Ești momentan cel mai mare ofertant.',
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
