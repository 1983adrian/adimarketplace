-- Create watchlist table for advanced product watching with notifications
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  notify_price_drop BOOLEAN DEFAULT true,
  notify_auction_ending BOOLEAN DEFAULT true,
  price_threshold NUMERIC DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Create saved_searches table for search alerts
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  query TEXT NOT NULL DEFAULT '',
  filters JSONB NOT NULL DEFAULT '{}',
  notify_on_new BOOLEAN DEFAULT true,
  last_notified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_history table for auction price tracking
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  price_type TEXT NOT NULL DEFAULT 'final', -- 'bid', 'final', 'buy_now'
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prohibited_items table for admin to configure blocked items
CREATE TABLE IF NOT EXISTS public.prohibited_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  category TEXT DEFAULT NULL,
  severity TEXT NOT NULL DEFAULT 'block', -- 'warn', 'block', 'flag'
  reason TEXT DEFAULT NULL,
  created_by UUID DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seller_limits table for new seller restrictions
CREATE TABLE IF NOT EXISTS public.seller_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  max_active_listings INTEGER DEFAULT 10,
  max_monthly_sales NUMERIC DEFAULT 5000,
  current_monthly_sales NUMERIC DEFAULT 0,
  limit_tier TEXT DEFAULT 'new', -- 'new', 'standard', 'trusted', 'unlimited'
  tier_upgraded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prohibited_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_limits ENABLE ROW LEVEL SECURITY;

-- Watchlist policies
CREATE POLICY "Users can manage their watchlist"
  ON public.watchlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Saved searches policies
CREATE POLICY "Users can manage their saved searches"
  ON public.saved_searches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Price history policies (read by all, write by system)
CREATE POLICY "Anyone can view price history"
  ON public.price_history FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage price history"
  ON public.price_history FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Prohibited items policies
CREATE POLICY "Anyone can view prohibited items"
  ON public.prohibited_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage prohibited items"
  ON public.prohibited_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seller limits policies
CREATE POLICY "Users can view their own limits"
  ON public.seller_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage seller limits"
  ON public.seller_limits FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add return_policy column to profiles for seller-level return policies
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS return_policy TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS return_days INTEGER DEFAULT 14;

-- Add return_policy to listings for product-level return policies
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS return_policy TEXT DEFAULT 'seller_default',
ADD COLUMN IF NOT EXISTS return_days INTEGER DEFAULT NULL;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_listing ON public.watchlist(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_listing ON public.price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_prohibited_items_keyword ON public.prohibited_items(keyword);
CREATE INDEX IF NOT EXISTS idx_seller_limits_user ON public.seller_limits(user_id);