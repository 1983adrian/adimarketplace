-- =====================================================
-- SCALABILITY OPTIMIZATION: 1M Products, 100K Sellers
-- Only indexes for existing tables
-- =====================================================

-- 1. LISTINGS TABLE INDEXES (for 1M+ products)
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_is_active_is_sold ON public.listings(is_active, is_sold);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_condition ON public.listings(condition);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON public.listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_auction_end ON public.listings(auction_end_date) WHERE listing_type = 'auction';
CREATE INDEX IF NOT EXISTS idx_listings_active_category ON public.listings(category_id, is_active, is_sold, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_active_seller ON public.listings(seller_id, is_active, created_at DESC);

-- 2. PROFILES TABLE INDEXES (for 100K+ sellers/buyers)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_seller ON public.profiles(is_seller) WHERE is_seller = true;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_total_sales ON public.profiles(total_sales_count DESC) WHERE is_seller = true;
CREATE INDEX IF NOT EXISTS idx_profiles_average_rating ON public.profiles(average_rating DESC) WHERE is_seller = true;

-- 3. ORDERS TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON public.orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_created ON public.orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller_created ON public.orders(seller_id, created_at DESC);

-- 4. MESSAGES & CONVERSATIONS INDEXES
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON public.messages(conversation_id, created_at DESC);

-- 5. BIDS TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON public.bids(listing_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);

-- 6. FAVORITES TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);

-- 7. LISTING IMAGES INDEXES
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_primary ON public.listing_images(listing_id, is_primary) WHERE is_primary = true;

-- 8. NOTIFICATIONS INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 9. FRIENDSHIPS INDEXES
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- 10. LISTING PROMOTIONS INDEXES
CREATE INDEX IF NOT EXISTS idx_promotions_listing_id ON public.listing_promotions(listing_id);
CREATE INDEX IF NOT EXISTS idx_promotions_seller_id ON public.listing_promotions(seller_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.listing_promotions(is_active, ends_at) WHERE is_active = true;

-- 11. DISPUTES TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_reporter_id ON public.disputes(reporter_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);

-- 12. INVOICES TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_id ON public.invoices(buyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_seller_id ON public.invoices(seller_id);

-- 13. PAYOUTS TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_payouts_seller_id ON public.payouts(seller_id);
CREATE INDEX IF NOT EXISTS idx_payouts_order_id ON public.payouts(order_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

-- 14. FRAUD ALERTS INDEXES
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity ON public.fraud_alerts(severity);

-- 15. LISTING REPORTS INDEXES
CREATE INDEX IF NOT EXISTS idx_listing_reports_listing_id ON public.listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_reporter_id ON public.listing_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.listing_reports(status);

-- 16. PLATFORM ACTIVITY INDEXES
CREATE INDEX IF NOT EXISTS idx_platform_activity_user_id ON public.platform_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_activity_entity ON public.platform_activity(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_platform_activity_created ON public.platform_activity(created_at DESC);

-- 17. AUDIT LOGS INDEXES
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 18. PRICE HISTORY INDEXES
CREATE INDEX IF NOT EXISTS idx_price_history_listing_id ON public.price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded ON public.price_history(recorded_at DESC);

-- 19. CATEGORIES INDEX
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 20. HOMEPAGE CONTENT INDEX
CREATE INDEX IF NOT EXISTS idx_homepage_content_section ON public.homepage_content(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_content_active ON public.homepage_content(is_active, sort_order);

-- ANALYZE CORE TABLES FOR QUERY OPTIMIZER
ANALYZE public.listings;
ANALYZE public.profiles;
ANALYZE public.orders;
ANALYZE public.messages;
ANALYZE public.conversations;
ANALYZE public.bids;
ANALYZE public.favorites;
ANALYZE public.notifications;