-- Add bid_increment field to listings for auction step
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS bid_increment numeric DEFAULT 1;

-- Create index for auction queries
CREATE INDEX IF NOT EXISTS idx_listings_auction_type ON public.listings(listing_type) WHERE listing_type = 'auction';
CREATE INDEX IF NOT EXISTS idx_listings_auction_end ON public.listings(auction_end_date) WHERE auction_end_date IS NOT NULL;

-- Enable realtime for bids table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;