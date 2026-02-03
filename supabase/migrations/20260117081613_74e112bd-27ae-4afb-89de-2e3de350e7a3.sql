-- Add seller verification and bidding support

-- Add seller verification fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verification_documents jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS paypal_email text;

-- Add bidding support to listings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS listing_type text DEFAULT 'buy_now' CHECK (listing_type IN ('buy_now', 'auction', 'both')),
ADD COLUMN IF NOT EXISTS auction_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS starting_bid numeric,
ADD COLUMN IF NOT EXISTS reserve_price numeric,
ADD COLUMN IF NOT EXISTS buy_now_price numeric;

-- Create bids table for auctions
CREATE TABLE IF NOT EXISTS public.bids (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL,
  amount numeric NOT NULL,
  is_winning boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on bids
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS policies for bids
CREATE POLICY "Anyone can view bids on active listings"
ON public.bids FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = bids.listing_id
    AND listings.is_active = true
  )
);

CREATE POLICY "Authenticated users can place bids"
ON public.bids FOR INSERT
WITH CHECK (auth.uid() = bidder_id);

-- Create returns table
CREATE TABLE IF NOT EXISTS public.returns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  refund_amount numeric,
  admin_notes text,
  tracking_number text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Enable RLS on returns
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- RLS policies for returns
CREATE POLICY "Users can view their own returns"
ON public.returns FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create returns"
ON public.returns FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update returns"
ON public.returns FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Admins can manage all returns"
ON public.returns FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  subtotal numeric NOT NULL,
  buyer_fee numeric DEFAULT 0,
  seller_commission numeric DEFAULT 0,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')),
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoices
CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "System can create invoices"
ON public.invoices FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all invoices"
ON public.invoices FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create saved_addresses table for users
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Home',
  first_name text NOT NULL,
  last_name text NOT NULL,
  address text NOT NULL,
  apartment text,
  city text NOT NULL,
  state text,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'UK',
  phone text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on saved_addresses
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_addresses
CREATE POLICY "Users can manage their own addresses"
ON public.saved_addresses FOR ALL
USING (auth.uid() = user_id);

-- Add shipping_address_id to orders for better tracking
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS saved_address_id uuid REFERENCES public.saved_addresses(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON public.saved_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON public.listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_auction_end ON public.listings(auction_end_date) WHERE listing_type IN ('auction', 'both');