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

      // Fetch bidder profiles using secure public view
      if (bids && bids.length > 0) {
        const bidderIds = [...new Set(bids.map(b => b.bidder_id))];
        const { data: profiles } = await supabase
          .from('public_seller_profiles')
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

      // Check for any active subscription (seller plan OR bidder plan)
      const { data: activeSub } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (!activeSub) {
        throw new Error('Ai nevoie de un abonament activ pentru a licita. Mergi la Planuri Vânzător pentru activare.');
      }

      // Check if bid is higher than current highest
      const { data: highestBid } = await supabase
        .from('bids')
        .select('amount, bidder_id')
        .eq('listing_id', listingId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (highestBid && amount <= highestBid.amount) {
        throw new Error(`Licitația ta trebuie să fie mai mare de £${highestBid.amount}`);
      }

      // RESTRICTION: User cannot bid again if they are the highest bidder
      if (highestBid && highestBid.bidder_id === user.id) {
        throw new Error('Ești deja cel mai mare ofertant. Așteaptă până altcineva licitează mai mult.');
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

      // Send notification to seller about new bid
      await supabase.from('notifications').insert({
        user_id: listing.seller_id,
        type: 'bid',
        title: '🔔 Licitație Nouă!',
        message: `Ai primit o licitație de £${amount.toFixed(2)} pe produsul tău.`,
        data: { listing_id: listingId, bid_id: data.id, amount },
      });

      // Notify previous highest bidder they were outbid
      if (highestBid && highestBid.bidder_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: highestBid.bidder_id,
          type: 'bid',
          title: '⚠️ Ai fost depășit!',
          message: `Cineva a licitat £${amount.toFixed(2)}, depășind oferta ta de £${highestBid.amount.toFixed(2)}.`,
          data: { listing_id: listingId, new_amount: amount, your_amount: highestBid.amount },
        });
      }

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

// Hook for sellers to see their auction listings with latest bids
export const useMyAuctionListings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-auction-listings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all auction listings for this seller
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          starting_bid,
          reserve_price,
          auction_end_date,
          listing_type,
          is_active,
          is_sold,
          listing_images (image_url, is_primary)
        `)
        .eq('seller_id', user.id)
        .in('listing_type', ['auction', 'both'])
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // For each listing, get the highest bid and bid count
      const listingsWithBids = await Promise.all(
        (listings || []).map(async (listing) => {
          const { data: highestBid } = await supabase
            .from('bids')
            .select('amount, bidder_id, created_at')
            .eq('listing_id', listing.id)
            .order('amount', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count } = await supabase
            .from('bids')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing.id);

          // Get bidder profile using secure public view
          let bidderProfile = null;
          if (highestBid) {
            const { data: profile } = await supabase
              .from('public_seller_profiles')
              .select('display_name, username, avatar_url')
              .eq('user_id', highestBid.bidder_id)
              .maybeSingle();
            bidderProfile = profile;
          }

          return {
            ...listing,
            highest_bid: highestBid?.amount || null,
            bid_count: count || 0,
            last_bid_at: highestBid?.created_at || null,
            bidder_profile: bidderProfile,
          };
        })
      );

      return listingsWithBids;
    },
    enabled: !!user,
  });
};
