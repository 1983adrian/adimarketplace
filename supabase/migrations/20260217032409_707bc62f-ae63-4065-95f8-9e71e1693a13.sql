
-- SCALABILITY OPTIMIZATION FOR 100K+ SELLERS & BUYERS
-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. LISTINGS indexes
CREATE INDEX IF NOT EXISTS idx_listings_active_category ON listings (category_id, is_active, is_sold) WHERE is_active = true AND is_sold = false;
CREATE INDEX IF NOT EXISTS idx_listings_active_price ON listings (price, created_at DESC) WHERE is_active = true AND is_sold = false;
CREATE INDEX IF NOT EXISTS idx_listings_seller_active ON listings (seller_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_type_active ON listings (listing_type, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_auction_end ON listings (auction_end_date) WHERE listing_type = 'auction' AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_created_desc ON listings (created_at DESC) WHERE is_active = true AND is_sold = false;
CREATE INDEX IF NOT EXISTS idx_listings_views_count ON listings (views_count DESC) WHERE is_active = true AND is_sold = false;
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings (seller_country, location) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON listings USING gin (title gin_trgm_ops);

-- 2. ORDERS indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON orders (buyer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller_status ON orders (seller_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_desc ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_pending ON orders (status, created_at) WHERE status = 'payment_pending';
CREATE INDEX IF NOT EXISTS idx_orders_payout_status ON orders (payout_status) WHERE payout_status = 'pending';

-- 3. PROFILES indexes
CREATE INDEX IF NOT EXISTS idx_profiles_seller_active ON profiles (is_seller, is_suspended, total_sales_count DESC) WHERE is_seller = true;
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON profiles (lower(username));
CREATE INDEX IF NOT EXISTS idx_profiles_short_id ON profiles (short_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_seller ON profiles (user_id) WHERE is_seller = true;

-- 4. MESSAGES indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (sender_id, is_read) WHERE is_read = false;

-- 5. NOTIFICATIONS indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_desc ON notifications (created_at DESC);

-- 6. WATCHLIST index
CREATE INDEX IF NOT EXISTS idx_watchlist_user_listing ON watchlist (user_id, listing_id);

-- 7. RETURNS indexes
CREATE INDEX IF NOT EXISTS idx_returns_buyer_status ON returns (buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_returns_seller_status ON returns (seller_id, status);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns (order_id);

-- 8. REVIEWS indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user ON reviews (reviewed_user_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews (order_id);

-- 9. SELLER SUBSCRIPTIONS index
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_user_status ON seller_subscriptions (user_id, status) WHERE status = 'active';

-- 10. SELLER PAYOUTS indexes
CREATE INDEX IF NOT EXISTS idx_seller_payouts_seller_status ON seller_payouts (seller_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_pending ON seller_payouts (status, created_at) WHERE status = 'pending';

-- 11. SAVED SEARCHES index
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches (user_id);

-- 12. LISTING IMAGES composite index
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_sort ON listing_images (listing_id, sort_order, is_primary DESC);

-- 13. PRICE HISTORY index
CREATE INDEX IF NOT EXISTS idx_price_history_listing_date ON price_history (listing_id, recorded_at DESC);

-- 14. Auto-vacuum tuning for high-write tables
ALTER TABLE listings SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE messages SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE notifications SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE favorites SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE profiles SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);

-- 15. Optimized seller listing count function
CREATE OR REPLACE FUNCTION public.get_seller_listing_count(p_seller_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer FROM listings 
  WHERE seller_id = p_seller_id AND is_active = true;
$$;

-- 16. Cached platform summary function
CREATE OR REPLACE FUNCTION public.get_platform_summary()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT stat_value FROM platform_statistics 
     WHERE stat_key = 'dashboard_stats' AND expires_at > now()
     LIMIT 1),
    jsonb_build_object(
      'total_listings', (SELECT COUNT(*) FROM listings WHERE is_active = true),
      'total_sellers', (SELECT COUNT(*) FROM profiles WHERE is_seller = true),
      'total_orders', (SELECT COUNT(*) FROM orders)
    )
  );
$$;
