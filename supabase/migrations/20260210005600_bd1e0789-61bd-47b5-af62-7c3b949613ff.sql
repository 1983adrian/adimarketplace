
-- ============================================================
-- SECURITY FIX: Change all policies from {public} to {authenticated}
-- for INSERT, UPDATE, DELETE, and ALL operations.
-- SELECT policies for public data (listings, categories, etc.) stay on {public}.
-- ============================================================

-- ===================== BIDS =====================
DROP POLICY IF EXISTS "Authenticated users can place bids" ON public.bids;
CREATE POLICY "Authenticated users can place bids" ON public.bids
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = bidder_id);

-- ===================== CONVERSATIONS =====================
DROP POLICY IF EXISTS "Participants can delete their conversations" ON public.conversations;
CREATE POLICY "Participants can delete their conversations" ON public.conversations
  FOR DELETE TO authenticated USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

DROP POLICY IF EXISTS "Authenticated users can create conversations for their listings" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations for their listings" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = buyer_id AND EXISTS (
      SELECT 1 FROM listings WHERE listings.id = conversations.listing_id AND listings.is_active = true
    )
  );

DROP POLICY IF EXISTS "Buyers can start conversations" ON public.conversations;
CREATE POLICY "Buyers can start conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Admins can update all conversations" ON public.conversations;
CREATE POLICY "Admins can update all conversations" ON public.conversations
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Participants can update their conversations" ON public.conversations;
CREATE POLICY "Participants can update their conversations" ON public.conversations
  FOR UPDATE TO authenticated 
  USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id))
  WITH CHECK ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
CREATE POLICY "Admins can view all conversations" ON public.conversations
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Participants can view their own conversations" ON public.conversations;
CREATE POLICY "Participants can view their own conversations" ON public.conversations
  FOR SELECT TO authenticated USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

-- ===================== DISPUTE EVIDENCE =====================
DROP POLICY IF EXISTS "Admins can manage evidence" ON public.dispute_evidence;
CREATE POLICY "Admins can manage evidence" ON public.dispute_evidence
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can upload evidence to their disputes" ON public.dispute_evidence;
CREATE POLICY "Users can upload evidence to their disputes" ON public.dispute_evidence
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = uploaded_by AND EXISTS (
      SELECT 1 FROM disputes WHERE disputes.id = dispute_evidence.dispute_id 
      AND (disputes.reporter_id = auth.uid() OR disputes.reported_user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Participants can view evidence" ON public.dispute_evidence;
CREATE POLICY "Participants can view evidence" ON public.dispute_evidence
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM disputes WHERE disputes.id = dispute_evidence.dispute_id 
      AND (disputes.reporter_id = auth.uid() OR disputes.reported_user_id = auth.uid())
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- ===================== FAVORITES =====================
DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;
CREATE POLICY "Users can remove favorites" ON public.favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
CREATE POLICY "Users can add favorites" ON public.favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their favorites" ON public.favorites;
CREATE POLICY "Users can view their favorites" ON public.favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ===================== FRIENDSHIPS =====================
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;
CREATE POLICY "Users can delete their friendships" ON public.friendships
  FOR DELETE TO authenticated USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;
CREATE POLICY "Users can send friend requests" ON public.friendships
  FOR INSERT TO authenticated WITH CHECK ((auth.uid() = requester_id) AND (requester_id <> addressee_id));

DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
CREATE POLICY "Users can view their friendships" ON public.friendships
  FOR SELECT TO authenticated USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

DROP POLICY IF EXISTS "Users can update their friendships" ON public.friendships;
CREATE POLICY "Users can update their friendships" ON public.friendships
  FOR UPDATE TO authenticated USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

-- ===================== EMAIL TEMPLATES =====================
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view email templates" ON public.email_templates;
CREATE POLICY "Admins can view email templates" ON public.email_templates
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================== FRAUD ALERTS =====================
DROP POLICY IF EXISTS "Admins can manage fraud alerts" ON public.fraud_alerts;
CREATE POLICY "Admins can manage fraud alerts" ON public.fraud_alerts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===================== HOMEPAGE CONTENT =====================
DROP POLICY IF EXISTS "Admins can manage homepage content" ON public.homepage_content;
CREATE POLICY "Admins can manage homepage content" ON public.homepage_content
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view active homepage content" ON public.homepage_content;
CREATE POLICY "Anyone can view active homepage content" ON public.homepage_content
  FOR SELECT TO anon, authenticated USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- ===================== INVOICES =====================
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
CREATE POLICY "Admins can manage all invoices" ON public.invoices
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT TO authenticated USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

-- ===================== LISTING IMAGES =====================
DROP POLICY IF EXISTS "Sellers can manage their listing images" ON public.listing_images;
CREATE POLICY "Sellers can manage their listing images" ON public.listing_images
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.seller_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.seller_id = auth.uid())
  );

-- Keep SELECT for anon (public listing images)
DROP POLICY IF EXISTS "Listing images viewable with listing" ON public.listing_images;
CREATE POLICY "Listing images viewable with listing" ON public.listing_images
  FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND (listings.is_active = true OR listings.seller_id = auth.uid()))
  );

-- ===================== LISTING PROMOTIONS =====================
DROP POLICY IF EXISTS "Admins can manage all promotions" ON public.listing_promotions;
CREATE POLICY "Admins can manage all promotions" ON public.listing_promotions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Sellers can create promotions for their listings" ON public.listing_promotions;
CREATE POLICY "Sellers can create promotions for their listings" ON public.listing_promotions
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = seller_id AND EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_promotions.listing_id AND listings.seller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Sellers can view their own promotions" ON public.listing_promotions;
CREATE POLICY "Sellers can view their own promotions" ON public.listing_promotions
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Anyone can view active promotions" ON public.listing_promotions;
CREATE POLICY "Anyone can view active promotions" ON public.listing_promotions
  FOR SELECT TO anon, authenticated USING (is_active = true AND ends_at > now());

-- ===================== LISTING REPORTS =====================
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.listing_reports;
CREATE POLICY "Admins can manage all reports" ON public.listing_reports
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can create reports" ON public.listing_reports;
CREATE POLICY "Users can create reports" ON public.listing_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view own reports" ON public.listing_reports;
CREATE POLICY "Users can view own reports" ON public.listing_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- ===================== LISTINGS =====================
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;
CREATE POLICY "Users can delete their own listings" ON public.listings
  FOR DELETE TO authenticated USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can create their own listings" ON public.listings;
CREATE POLICY "Users can create their own listings" ON public.listings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
CREATE POLICY "Users can update their own listings" ON public.listings
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id);

-- Keep SELECT for anon (public marketplace)
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.listings;
CREATE POLICY "Active listings are viewable by everyone" ON public.listings
  FOR SELECT TO anon, authenticated USING (is_active = true OR auth.uid() = seller_id);

-- ===================== MESSAGES =====================
DROP POLICY IF EXISTS "Participants can delete messages in their conversations" ON public.messages;
CREATE POLICY "Participants can delete messages in their conversations" ON public.messages
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id 
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Participants can send messages in their conversations" ON public.messages;
CREATE POLICY "Participants can send messages in their conversations" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
      SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id 
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can send messages to any conversation" ON public.messages;
CREATE POLICY "Admins can send messages to any conversation" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Participants can view messages in their conversations" ON public.messages;
CREATE POLICY "Participants can view messages in their conversations" ON public.messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id 
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid()))
  );

-- ===================== NEWSLETTER SUBSCRIBERS =====================
DROP POLICY IF EXISTS "newsletter_admin_only_delete" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_only_delete" ON public.newsletter_subscribers
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "newsletter_admin_only_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_only_insert" ON public.newsletter_subscribers
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Authenticated users can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND email IS NOT NULL AND email <> '' AND email ~~ '%@%.%');

DROP POLICY IF EXISTS "newsletter_admin_only_select" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_only_select" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "newsletter_admin_only_update" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_only_update" ON public.newsletter_subscribers
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================== PAYOUTS =====================
DROP POLICY IF EXISTS "Admins can manage all payouts" ON public.payouts;
CREATE POLICY "Admins can manage all payouts" ON public.payouts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Sellers can view their payouts" ON public.payouts;
CREATE POLICY "Sellers can view their payouts" ON public.payouts
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);

-- ===================== PLATFORM ACTIVITY =====================
DROP POLICY IF EXISTS "Admins can manage all activity" ON public.platform_activity;
CREATE POLICY "Admins can manage all activity" ON public.platform_activity
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view public activity" ON public.platform_activity;
CREATE POLICY "Anyone can view public activity" ON public.platform_activity
  FOR SELECT TO anon, authenticated USING (is_public = true);

-- ===================== PLATFORM FEES =====================
DROP POLICY IF EXISTS "Admins can insert platform fees" ON public.platform_fees;
CREATE POLICY "Admins can insert platform fees" ON public.platform_fees
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update platform fees" ON public.platform_fees;
CREATE POLICY "Admins can update platform fees" ON public.platform_fees
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view platform fees" ON public.platform_fees;
CREATE POLICY "Anyone can view platform fees" ON public.platform_fees
  FOR SELECT TO anon, authenticated USING (true);

-- ===================== PLATFORM HEALTH =====================
DROP POLICY IF EXISTS "Admins can manage platform health" ON public.platform_health;
CREATE POLICY "Admins can manage platform health" ON public.platform_health
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view platform health" ON public.platform_health;
CREATE POLICY "Anyone can view platform health" ON public.platform_health
  FOR SELECT TO anon, authenticated USING (true);

-- ===================== PLATFORM SETTINGS =====================
DROP POLICY IF EXISTS "Admins can manage platform settings" ON public.platform_settings;
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
  FOR SELECT TO anon, authenticated USING (true);

-- ===================== PLATFORM STATISTICS =====================
DROP POLICY IF EXISTS "Admins can manage statistics" ON public.platform_statistics;
CREATE POLICY "Admins can manage statistics" ON public.platform_statistics
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view statistics" ON public.platform_statistics;
CREATE POLICY "Anyone can view statistics" ON public.platform_statistics
  FOR SELECT TO anon, authenticated USING (true);

-- ===================== POLICIES CONTENT =====================
DROP POLICY IF EXISTS "Admins can manage policies" ON public.policies_content;
CREATE POLICY "Admins can manage policies" ON public.policies_content
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view published policies" ON public.policies_content;
CREATE POLICY "Anyone can view published policies" ON public.policies_content
  FOR SELECT TO anon, authenticated USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

-- ===================== PRICE HISTORY =====================
DROP POLICY IF EXISTS "Admins can manage price history" ON public.price_history;
CREATE POLICY "Admins can manage price history" ON public.price_history
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view price history" ON public.price_history;
CREATE POLICY "Anyone can view price history" ON public.price_history
  FOR SELECT TO anon, authenticated USING (true);

-- ===================== PROFILES =====================
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can only see their own profile" ON public.profiles;
-- This was on {public}, recreate on authenticated only
-- profiles_strict_select already covers this

DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===================== PROHIBITED ITEMS =====================
DROP POLICY IF EXISTS "Admins can manage prohibited items" ON public.prohibited_items;
CREATE POLICY "Admins can manage prohibited items" ON public.prohibited_items
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view prohibited items" ON public.prohibited_items;
CREATE POLICY "Anyone can view prohibited items" ON public.prohibited_items
  FOR SELECT TO anon, authenticated USING (true);

-- ===================== PUSH NOTIFICATION LOG =====================
DROP POLICY IF EXISTS "Admins can manage push logs" ON public.push_notification_log;
CREATE POLICY "Admins can manage push logs" ON public.push_notification_log
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===================== PUSH TOKENS =====================
DROP POLICY IF EXISTS "Users can delete their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can delete their own push tokens" ON public.push_tokens
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can insert their own push tokens" ON public.push_tokens
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can view their own push tokens" ON public.push_tokens
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all push tokens" ON public.push_tokens;
CREATE POLICY "Admins can view all push tokens" ON public.push_tokens
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can update their own push tokens" ON public.push_tokens
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===================== REFUNDS =====================
DROP POLICY IF EXISTS "Admins can manage all refunds" ON public.refunds;
CREATE POLICY "Admins can manage all refunds" ON public.refunds
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can request refunds for their orders" ON public.refunds;
CREATE POLICY "Users can request refunds for their orders" ON public.refunds
  FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their refunds" ON public.refunds;
CREATE POLICY "Users can view their refunds" ON public.refunds
  FOR SELECT TO authenticated USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update refunds" ON public.refunds;
CREATE POLICY "Only admins can update refunds" ON public.refunds
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===================== RETURNS =====================
DROP POLICY IF EXISTS "Admins can manage all returns" ON public.returns;
CREATE POLICY "Admins can manage all returns" ON public.returns
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Buyers can create returns" ON public.returns;
CREATE POLICY "Buyers can create returns" ON public.returns
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can view their own returns" ON public.returns;
CREATE POLICY "Users can view their own returns" ON public.returns
  FOR SELECT TO authenticated USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

DROP POLICY IF EXISTS "Participants can update returns" ON public.returns;
CREATE POLICY "Participants can update returns" ON public.returns
  FOR UPDATE TO authenticated USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

-- ===================== REVIEWS =====================
DROP POLICY IF EXISTS "Order participants can create reviews" ON public.reviews;
CREATE POLICY "Order participants can create reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = reviewer_id AND EXISTS (
      SELECT 1 FROM orders WHERE orders.id = reviews.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Order participants can view reviews" ON public.reviews;
CREATE POLICY "Order participants can view reviews" ON public.reviews
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = reviews.order_id 
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view reviews" ON public.reviews
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
CREATE POLICY "Admins can view all reviews" ON public.reviews
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================== SAVED ADDRESSES =====================
DROP POLICY IF EXISTS "Buyers can view seller address for approved returns" ON public.saved_addresses;
CREATE POLICY "Buyers can view seller address for approved returns" ON public.saved_addresses
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM returns r
      WHERE r.status = 'approved' AND r.buyer_id = auth.uid() AND r.seller_id = saved_addresses.user_id
    )
  );

DROP POLICY IF EXISTS "saved_addresses_admin_select" ON public.saved_addresses;
CREATE POLICY "saved_addresses_admin_select" ON public.saved_addresses
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "saved_addresses_strict_delete" ON public.saved_addresses;
CREATE POLICY "saved_addresses_strict_delete" ON public.saved_addresses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_addresses_strict_select" ON public.saved_addresses;
CREATE POLICY "saved_addresses_strict_select" ON public.saved_addresses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_addresses_strict_update" ON public.saved_addresses;
CREATE POLICY "saved_addresses_strict_update" ON public.saved_addresses
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_addresses_strict_insert" ON public.saved_addresses;
CREATE POLICY "saved_addresses_strict_insert" ON public.saved_addresses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===================== SAVED SEARCHES =====================
DROP POLICY IF EXISTS "Users can manage their saved searches" ON public.saved_searches;
CREATE POLICY "Users can manage their saved searches" ON public.saved_searches
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===================== SECURITY EVENTS =====================
DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;
CREATE POLICY "Admins can view security events" ON public.security_events
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================== SELLER LIMITS =====================
DROP POLICY IF EXISTS "Admins can manage seller limits" ON public.seller_limits;
CREATE POLICY "Admins can manage seller limits" ON public.seller_limits
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view their own limits" ON public.seller_limits;
CREATE POLICY "Users can view their own limits" ON public.seller_limits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ===================== SELLER PAYOUTS =====================
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.seller_payouts;
CREATE POLICY "Admins can manage payouts" ON public.seller_payouts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage all payouts" ON public.seller_payouts;
CREATE POLICY "Admins can manage all payouts" ON public.seller_payouts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Sellers can view their own payouts" ON public.seller_payouts;
CREATE POLICY "Sellers can view their own payouts" ON public.seller_payouts
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can view their payouts" ON public.seller_payouts;
CREATE POLICY "Sellers can view their payouts" ON public.seller_payouts
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);

-- ===================== SELLER SUBSCRIPTIONS =====================
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.seller_subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON public.seller_subscriptions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.seller_subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.seller_subscriptions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.seller_subscriptions;
CREATE POLICY "Users can view their own subscription" ON public.seller_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.seller_subscriptions;
CREATE POLICY "Users can update their own subscription" ON public.seller_subscriptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===================== SENSITIVE DATA ACCESS LOG =====================
DROP POLICY IF EXISTS "Only admins can view access logs" ON public.sensitive_data_access_log;
CREATE POLICY "Only admins can view access logs" ON public.sensitive_data_access_log
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================== SEO INDEXING QUEUE =====================
DROP POLICY IF EXISTS "Admins can manage SEO indexing queue" ON public.seo_indexing_queue;
CREATE POLICY "Admins can manage SEO indexing queue" ON public.seo_indexing_queue
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===================== SEO KEYWORDS =====================
DROP POLICY IF EXISTS "Admins can manage SEO keywords" ON public.seo_keywords;
CREATE POLICY "Admins can manage SEO keywords" ON public.seo_keywords
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===================== SEO SETTINGS =====================
DROP POLICY IF EXISTS "Admins can manage SEO settings" ON public.seo_settings;
CREATE POLICY "Admins can manage SEO settings" ON public.seo_settings
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view SEO settings" ON public.seo_settings;
CREATE POLICY "Anyone can view SEO settings" ON public.seo_settings
  FOR SELECT TO anon, authenticated USING (true);

-- ===================== SITEMAP ENTRIES =====================
DROP POLICY IF EXISTS "Admins can manage sitemap entries" ON public.sitemap_entries;
CREATE POLICY "Admins can manage sitemap entries" ON public.sitemap_entries
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view active sitemap entries" ON public.sitemap_entries;
CREATE POLICY "Anyone can view active sitemap entries" ON public.sitemap_entries
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- ===================== USER ROLES =====================
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "User roles viewable by owner" ON public.user_roles;
CREATE POLICY "User roles viewable by owner" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ===================== WATCHLIST =====================
DROP POLICY IF EXISTS "Users can manage their watchlist" ON public.watchlist;
CREATE POLICY "Users can manage their watchlist" ON public.watchlist
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===================== WEBHOOK LOGS =====================
DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================== CATEGORIES =====================
-- Admin management to authenticated only
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Keep public read for categories (needed for browsing)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);

-- ===================== CONTENT FRESHNESS =====================
DROP POLICY IF EXISTS "Admins can manage content freshness" ON public.content_freshness;
CREATE POLICY "Admins can manage content freshness" ON public.content_freshness
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view content freshness" ON public.content_freshness;
CREATE POLICY "Anyone can view content freshness" ON public.content_freshness
  FOR SELECT TO anon, authenticated USING (true);

-- ===================== CONTACT SUBMISSIONS =====================
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ===================== PASSWORD RESET ATTEMPTS =====================
DROP POLICY IF EXISTS "password_reset_attempts_admin_only" ON public.password_reset_attempts;
CREATE POLICY "password_reset_attempts_admin_only" ON public.password_reset_attempts
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================== STORAGE: Fix storage policies =====================
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
CREATE POLICY "Users can delete their own listing images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'listings' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listings' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
CREATE POLICY "Users can update their own listing images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'listings' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Keep public SELECT for listing images (they need to be viewable)
DROP POLICY IF EXISTS "Listing images are publicly accessible" ON storage.objects;
CREATE POLICY "Listing images are publicly accessible" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'listings');
