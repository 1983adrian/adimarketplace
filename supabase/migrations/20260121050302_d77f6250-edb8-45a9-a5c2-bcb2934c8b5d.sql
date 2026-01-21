-- Add performance indexes for scaling to 10,000+ sellers
-- These indexes improve query performance on frequently accessed columns

-- Index for faster seller lookups
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);

-- Index for active listings filtering
CREATE INDEX IF NOT EXISTS idx_listings_active_sold ON public.listings(is_active, is_sold);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_id);

-- Index for location-based searches
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location);

-- Index for price sorting/filtering
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);

-- Index for created_at sorting (newest first)
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- Composite index for common query pattern (active listings sorted by date)
CREATE INDEX IF NOT EXISTS idx_listings_active_created ON public.listings(is_active, is_sold, created_at DESC) WHERE is_active = true AND is_sold = false;

-- Index for orders by buyer
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);

-- Index for orders by seller
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);

-- Index for profiles by user_id (if not already primary)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Index for favorites lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_listing ON public.favorites(user_id, listing_id);

-- Index for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON public.conversations(seller_id);