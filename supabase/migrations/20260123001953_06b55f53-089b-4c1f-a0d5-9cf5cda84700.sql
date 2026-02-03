-- Additional performance indexes for 10,000+ sellers scalability
-- These indexes optimize the most common query patterns

-- Index for faster user lookup by email (admin verification)
CREATE INDEX IF NOT EXISTS idx_admin_emails_email_lower 
ON public.admin_emails (LOWER(email)) WHERE is_active = true;

-- Index for faster order aggregation by seller (top seller calculations)
CREATE INDEX IF NOT EXISTS idx_orders_seller_status_delivered 
ON public.orders (seller_id) WHERE status = 'delivered';

-- Index for faster order lookup by buyer
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id 
ON public.orders (buyer_id);

-- Index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications (user_id, is_read) WHERE is_read = false;

-- Index for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON public.messages (conversation_id, created_at DESC);

-- Index for faster unread message counts
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON public.messages (conversation_id, is_read) WHERE is_read = false;

-- Index for faster profile lookups by user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON public.profiles (user_id);

-- Index for verified sellers (fast badge display)
CREATE INDEX IF NOT EXISTS idx_profiles_verified_sellers 
ON public.profiles (user_id) WHERE is_verified = true;

-- Index for faster favorite lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_listing 
ON public.favorites (user_id, listing_id);

-- Index for faster bid lookups on active listings
CREATE INDEX IF NOT EXISTS idx_bids_listing_amount 
ON public.bids (listing_id, amount DESC);

-- Index for faster review aggregation
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user 
ON public.reviews (reviewed_user_id);

-- Index for faster payout tracking
CREATE INDEX IF NOT EXISTS idx_seller_payouts_seller_status 
ON public.seller_payouts (seller_id, status);

-- Index for faster subscription status checks
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_user_status 
ON public.seller_subscriptions (user_id, status);

-- Index for faster dispute resolution
CREATE INDEX IF NOT EXISTS idx_disputes_status 
ON public.disputes (status) WHERE status != 'resolved';

-- Index for faster return processing
CREATE INDEX IF NOT EXISTS idx_returns_status 
ON public.returns (status) WHERE status != 'resolved';

-- Composite index for listing search with multiple filters
CREATE INDEX IF NOT EXISTS idx_listings_search_composite 
ON public.listings (is_active, is_sold, category_id, created_at DESC) 
WHERE is_active = true AND is_sold = false;

-- Index for faster conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON public.conversations (buyer_id, seller_id);

-- Index for webhook processing
CREATE INDEX IF NOT EXISTS idx_webhook_logs_unprocessed 
ON public.webhook_logs (processor, processed) WHERE processed = false;