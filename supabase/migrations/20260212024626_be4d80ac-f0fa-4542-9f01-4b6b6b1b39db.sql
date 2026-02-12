
-- Fix Anonymous Access Policies: Add TO authenticated to all RLS policies that lack it
-- This prevents anonymous users from matching these policies

-- ============ admin_emails ============
DROP POLICY IF EXISTS "Authenticated admins can manage admin emails" ON public.admin_emails;
CREATE POLICY "Authenticated admins can manage admin emails" ON public.admin_emails
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ audit_logs ============
DROP POLICY IF EXISTS "Admins can insert own audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert own audit logs" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND (admin_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Renamed policy check
DROP POLICY IF EXISTS "Authenticated admins can manage audit logs" ON public.audit_logs;

-- ============ bids ============
DROP POLICY IF EXISTS "Authenticated users can place bids" ON public.bids;
CREATE POLICY "Authenticated users can place bids" ON public.bids
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = bidder_id);

DROP POLICY IF EXISTS "Authenticated users can view bids on active listings" ON public.bids;
CREATE POLICY "Authenticated users can view bids on active listings" ON public.bids
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM listings WHERE listings.id = bids.listing_id AND listings.is_active = true));

DROP POLICY IF EXISTS "Bidders can view own bids" ON public.bids;
CREATE POLICY "Bidders can view own bids" ON public.bids
FOR SELECT TO authenticated
USING (auth.uid() = bidder_id);

DROP POLICY IF EXISTS "Sellers can view bids on their listings" ON public.bids;
CREATE POLICY "Sellers can view bids on their listings" ON public.bids
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM listings WHERE listings.id = bids.listing_id AND listings.seller_id = auth.uid()));

-- ============ campaign_sends ============
DROP POLICY IF EXISTS "campaign_sends_admin_only" ON public.campaign_sends;
CREATE POLICY "campaign_sends_admin_only" ON public.campaign_sends
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ categories (keep public SELECT, fix admin ALL) ============
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ contact_submissions ============
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can manage contact submissions" ON public.contact_submissions
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can submit contact form" ON public.contact_submissions;
CREATE POLICY "Authenticated users can submit contact form" ON public.contact_submissions
FOR INSERT TO authenticated
WITH CHECK (name IS NOT NULL AND name <> '' AND email IS NOT NULL AND email <> '' AND subject IS NOT NULL AND subject <> '' AND message IS NOT NULL AND message <> '');

DROP POLICY IF EXISTS "Only admins can read contact submissions" ON public.contact_submissions;
CREATE POLICY "Only admins can read contact submissions" ON public.contact_submissions
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ content_freshness ============
DROP POLICY IF EXISTS "Admins can manage content freshness" ON public.content_freshness;
CREATE POLICY "Admins can manage content freshness" ON public.content_freshness
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ conversations ============
DROP POLICY IF EXISTS "Admins can update all conversations" ON public.conversations;
CREATE POLICY "Admins can update all conversations" ON public.conversations
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
CREATE POLICY "Admins can view all conversations" ON public.conversations
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can create conversations for their listings" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations for their listings" ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = buyer_id AND EXISTS (SELECT 1 FROM listings WHERE listings.id = conversations.listing_id AND listings.is_active = true));

DROP POLICY IF EXISTS "Buyers can start conversations" ON public.conversations;
CREATE POLICY "Buyers can start conversations" ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Participants can delete their conversations" ON public.conversations;
CREATE POLICY "Participants can delete their conversations" ON public.conversations
FOR DELETE TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Participants can update their conversations" ON public.conversations;
CREATE POLICY "Participants can update their conversations" ON public.conversations
FOR UPDATE TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Participants can view their own conversations" ON public.conversations;
CREATE POLICY "Participants can view their own conversations" ON public.conversations
FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============ dispute_evidence ============
DROP POLICY IF EXISTS "Admins can manage evidence" ON public.dispute_evidence;
CREATE POLICY "Admins can manage evidence" ON public.dispute_evidence
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Participants can view evidence" ON public.dispute_evidence;
CREATE POLICY "Participants can view evidence" ON public.dispute_evidence
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM disputes WHERE disputes.id = dispute_evidence.dispute_id AND (disputes.reporter_id = auth.uid() OR disputes.reported_user_id = auth.uid())) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can upload evidence to their disputes" ON public.dispute_evidence;
CREATE POLICY "Users can upload evidence to their disputes" ON public.dispute_evidence
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = uploaded_by AND EXISTS (SELECT 1 FROM disputes WHERE disputes.id = dispute_evidence.dispute_id AND (disputes.reporter_id = auth.uid() OR disputes.reported_user_id = auth.uid())));

-- ============ disputes ============
DROP POLICY IF EXISTS "Admins can manage all disputes" ON public.disputes;
CREATE POLICY "Admins can manage all disputes" ON public.disputes
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can create disputes" ON public.disputes;
CREATE POLICY "Users can create disputes" ON public.disputes
FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own disputes" ON public.disputes;
CREATE POLICY "Users can view their own disputes" ON public.disputes
FOR SELECT TO authenticated
USING (reporter_id = auth.uid() OR reported_user_id = auth.uid());

-- ============ email_templates ============
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email templates" ON public.email_templates
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view email templates" ON public.email_templates;

-- ============ favorites ============
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
CREATE POLICY "Users can add favorites" ON public.favorites
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;
CREATE POLICY "Users can remove favorites" ON public.favorites
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their favorites" ON public.favorites;
CREATE POLICY "Users can view their favorites" ON public.favorites
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============ fraud_alerts ============
DROP POLICY IF EXISTS "Admins can manage fraud alerts" ON public.fraud_alerts;
CREATE POLICY "Admins can manage fraud alerts" ON public.fraud_alerts
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ friendships ============
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;
CREATE POLICY "Users can delete their friendships" ON public.friendships
FOR DELETE TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;
CREATE POLICY "Users can send friend requests" ON public.friendships
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = requester_id AND requester_id <> addressee_id);

DROP POLICY IF EXISTS "Users can update their friendships" ON public.friendships;
CREATE POLICY "Users can update their friendships" ON public.friendships
FOR UPDATE TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
CREATE POLICY "Users can view their friendships" ON public.friendships
FOR SELECT TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ============ homepage_content ============
DROP POLICY IF EXISTS "Admins can manage homepage content" ON public.homepage_content;
CREATE POLICY "Admins can manage homepage content" ON public.homepage_content
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ invoices ============
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
CREATE POLICY "Admins can manage all invoices" ON public.invoices
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can create invoices for their orders" ON public.invoices;
CREATE POLICY "Authenticated users can create invoices for their orders" ON public.invoices
FOR INSERT TO authenticated
WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" ON public.invoices
FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============ listing_images ============
DROP POLICY IF EXISTS "Sellers can manage their listing images" ON public.listing_images;
CREATE POLICY "Sellers can manage their listing images" ON public.listing_images
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.seller_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.seller_id = auth.uid()));

-- ============ listing_promotions ============
DROP POLICY IF EXISTS "Admins can manage all promotions" ON public.listing_promotions;
CREATE POLICY "Admins can manage all promotions" ON public.listing_promotions
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Sellers can create promotions for their listings" ON public.listing_promotions;
CREATE POLICY "Sellers can create promotions for their listings" ON public.listing_promotions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = seller_id AND EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_promotions.listing_id AND listings.seller_id = auth.uid()));

DROP POLICY IF EXISTS "Sellers can view their own promotions" ON public.listing_promotions;
CREATE POLICY "Sellers can view their own promotions" ON public.listing_promotions
FOR SELECT TO authenticated
USING (auth.uid() = seller_id);

-- ============ listing_reports ============
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.listing_reports;
CREATE POLICY "Admins can manage all reports" ON public.listing_reports
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can create reports" ON public.listing_reports;
CREATE POLICY "Users can create reports" ON public.listing_reports
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view own reports" ON public.listing_reports;
CREATE POLICY "Users can view own reports" ON public.listing_reports
FOR SELECT TO authenticated
USING (auth.uid() = reporter_id);

-- ============ listings (keep public SELECT for browsing) ============
DROP POLICY IF EXISTS "Users can create their own listings" ON public.listings;
CREATE POLICY "Users can create their own listings" ON public.listings
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;
CREATE POLICY "Users can delete their own listings" ON public.listings
FOR DELETE TO authenticated
USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
CREATE POLICY "Users can update their own listings" ON public.listings
FOR UPDATE TO authenticated
USING (auth.uid() = seller_id);

-- ============ marketing_campaigns ============
DROP POLICY IF EXISTS "marketing_campaigns_admin_only" ON public.marketing_campaigns;
CREATE POLICY "marketing_campaigns_admin_only" ON public.marketing_campaigns
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ messages ============
DROP POLICY IF EXISTS "Admins can send messages to any conversation" ON public.messages;
CREATE POLICY "Admins can send messages to any conversation" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages" ON public.messages
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Participants can delete messages in their conversations" ON public.messages;
CREATE POLICY "Participants can delete messages in their conversations" ON public.messages
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())));

DROP POLICY IF EXISTS "Participants can send messages in their conversations" ON public.messages;
CREATE POLICY "Participants can send messages in their conversations" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));

DROP POLICY IF EXISTS "Participants can view messages in their conversations" ON public.messages;
CREATE POLICY "Participants can view messages in their conversations" ON public.messages
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())));

-- ============ newsletter_subscribers ============
DROP POLICY IF EXISTS "Authenticated users can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Authenticated users can subscribe to newsletter" ON public.newsletter_subscribers
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND email IS NOT NULL AND email <> '' AND email ~~ '%@%.%');

DROP POLICY IF EXISTS "newsletter_admin_only_delete" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_only_delete" ON public.newsletter_subscribers
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "newsletter_admin_only_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_only_insert" ON public.newsletter_subscribers
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "newsletter_admin_only_select" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_only_select" ON public.newsletter_subscribers
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "newsletter_admin_only_update" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_only_update" ON public.newsletter_subscribers
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ notifications ============
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can receive notifications" ON public.notifications;
CREATE POLICY "Users can receive notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============ orders ============
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Participants can update orders" ON public.orders;
CREATE POLICY "Participants can update orders" ON public.orders
FOR UPDATE TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can view their orders" ON public.orders;
CREATE POLICY "Users can view their orders" ON public.orders
FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============ password_reset_attempts ============
DROP POLICY IF EXISTS "password_reset_attempts_admin_only" ON public.password_reset_attempts;
CREATE POLICY "password_reset_attempts_admin_only" ON public.password_reset_attempts
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "password_reset_attempts_no_direct_insert" ON public.password_reset_attempts;
CREATE POLICY "password_reset_attempts_no_direct_insert" ON public.password_reset_attempts
FOR INSERT TO authenticated
WITH CHECK (false);

-- ============ payment_processor_settings ============
DROP POLICY IF EXISTS "Admins can manage payment processor settings" ON public.payment_processor_settings;
CREATE POLICY "Admins can manage payment processor settings" ON public.payment_processor_settings
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ payouts ============
DROP POLICY IF EXISTS "Admins can manage all payouts" ON public.payouts;
CREATE POLICY "Admins can manage all payouts" ON public.payouts
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Sellers can view their payouts" ON public.payouts;
CREATE POLICY "Sellers can view their payouts" ON public.payouts
FOR SELECT TO authenticated
USING (auth.uid() = seller_id);

-- ============ platform_activity ============
DROP POLICY IF EXISTS "Admins can manage all activity" ON public.platform_activity;
CREATE POLICY "Admins can manage all activity" ON public.platform_activity
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ platform_fees ============
DROP POLICY IF EXISTS "Admins can update platform fees" ON public.platform_fees;
CREATE POLICY "Admins can update platform fees" ON public.platform_fees
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ platform_health ============
DROP POLICY IF EXISTS "Admins can manage platform health" ON public.platform_health;
CREATE POLICY "Admins can manage platform health" ON public.platform_health
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ platform_settings ============
DROP POLICY IF EXISTS "Admins can manage platform settings" ON public.platform_settings;
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ platform_statistics ============
DROP POLICY IF EXISTS "Admins can manage statistics" ON public.platform_statistics;
CREATE POLICY "Admins can manage statistics" ON public.platform_statistics
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ policies_content ============
DROP POLICY IF EXISTS "Admins can manage policies" ON public.policies_content;
CREATE POLICY "Admins can manage policies" ON public.policies_content
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ price_history ============
DROP POLICY IF EXISTS "Admins can manage price history" ON public.price_history;
CREATE POLICY "Admins can manage price history" ON public.price_history
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ profiles ============
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update blocking fields" ON public.profiles;
CREATE POLICY "Admins can update blocking fields" ON public.profiles
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "profiles_strict_select" ON public.profiles;
CREATE POLICY "profiles_strict_select" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "profiles_strict_update" ON public.profiles;
CREATE POLICY "profiles_strict_update" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- ============ prohibited_items ============
DROP POLICY IF EXISTS "Admins can manage prohibited items" ON public.prohibited_items;
CREATE POLICY "Admins can manage prohibited items" ON public.prohibited_items
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ push_notification_log ============
DROP POLICY IF EXISTS "Admins can manage push logs" ON public.push_notification_log;
CREATE POLICY "Admins can manage push logs" ON public.push_notification_log
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ push_tokens ============
DROP POLICY IF EXISTS "Admins can view all push tokens" ON public.push_tokens;
CREATE POLICY "Admins can view all push tokens" ON public.push_tokens
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can delete their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can delete their own push tokens" ON public.push_tokens
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can update their own push tokens" ON public.push_tokens
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can view their own push tokens" ON public.push_tokens
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============ refunds ============
DROP POLICY IF EXISTS "Admins can manage all refunds" ON public.refunds;
CREATE POLICY "Admins can manage all refunds" ON public.refunds
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update refunds" ON public.refunds;
CREATE POLICY "Only admins can update refunds" ON public.refunds
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view their refunds" ON public.refunds;
CREATE POLICY "Users can view their refunds" ON public.refunds
FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============ returns ============
DROP POLICY IF EXISTS "Admins can manage all returns" ON public.returns;
CREATE POLICY "Admins can manage all returns" ON public.returns
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Participants can update returns" ON public.returns;
CREATE POLICY "Participants can update returns" ON public.returns
FOR UPDATE TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can view their own returns" ON public.returns;
CREATE POLICY "Users can view their own returns" ON public.returns
FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============ reviews ============
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
CREATE POLICY "Admins can view all reviews" ON public.reviews
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view reviews" ON public.reviews
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Order participants can view reviews" ON public.reviews;
CREATE POLICY "Order participants can view reviews" ON public.reviews
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = reviews.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())));

-- ============ saved_addresses ============
DROP POLICY IF EXISTS "Buyers can view seller address for approved returns" ON public.saved_addresses;
CREATE POLICY "Buyers can view seller address for approved returns" ON public.saved_addresses
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM returns WHERE (returns.status = 'approved' OR returns.status = 'completed') AND returns.buyer_id = auth.uid() AND returns.seller_id = saved_addresses.user_id));

DROP POLICY IF EXISTS "saved_addresses_admin_access" ON public.saved_addresses;
CREATE POLICY "saved_addresses_admin_access" ON public.saved_addresses
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "saved_addresses_admin_select" ON public.saved_addresses;
CREATE POLICY "saved_addresses_admin_select" ON public.saved_addresses
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "saved_addresses_owner_delete" ON public.saved_addresses;
CREATE POLICY "saved_addresses_owner_delete" ON public.saved_addresses
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_addresses_owner_select" ON public.saved_addresses;
CREATE POLICY "saved_addresses_owner_select" ON public.saved_addresses
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_addresses_owner_update" ON public.saved_addresses;
CREATE POLICY "saved_addresses_owner_update" ON public.saved_addresses
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_addresses_return_buyer_view" ON public.saved_addresses;
CREATE POLICY "saved_addresses_return_buyer_view" ON public.saved_addresses
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM returns WHERE (returns.status = 'approved' OR returns.status = 'completed') AND returns.buyer_id = auth.uid() AND returns.seller_id = saved_addresses.user_id));

DROP POLICY IF EXISTS "saved_addresses_strict_delete" ON public.saved_addresses;
CREATE POLICY "saved_addresses_strict_delete" ON public.saved_addresses
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_addresses_strict_select" ON public.saved_addresses;
CREATE POLICY "saved_addresses_strict_select" ON public.saved_addresses
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "saved_addresses_strict_update" ON public.saved_addresses;
CREATE POLICY "saved_addresses_strict_update" ON public.saved_addresses
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- ============ saved_searches ============
DROP POLICY IF EXISTS "Users can manage their saved searches" ON public.saved_searches;
CREATE POLICY "Users can manage their saved searches" ON public.saved_searches
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============ security_events ============
DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;
CREATE POLICY "Admins can view security events" ON public.security_events
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ seller_limits ============
DROP POLICY IF EXISTS "Admins can manage seller limits" ON public.seller_limits;
CREATE POLICY "Admins can manage seller limits" ON public.seller_limits
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view their own limits" ON public.seller_limits;
CREATE POLICY "Users can view their own limits" ON public.seller_limits
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============ seller_payouts ============
DROP POLICY IF EXISTS "Admins can manage all payouts" ON public.seller_payouts;
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.seller_payouts;
CREATE POLICY "Admins can manage payouts" ON public.seller_payouts
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Sellers can view their own payouts" ON public.seller_payouts;
DROP POLICY IF EXISTS "Sellers can view their payouts" ON public.seller_payouts;
CREATE POLICY "Sellers can view their payouts" ON public.seller_payouts
FOR SELECT TO authenticated
USING (auth.uid() = seller_id);

-- ============ seller_subscriptions ============
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.seller_subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON public.seller_subscriptions
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.seller_subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.seller_subscriptions
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.seller_subscriptions;
CREATE POLICY "Users can update their own subscription" ON public.seller_subscriptions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.seller_subscriptions;
CREATE POLICY "Users can view their own subscription" ON public.seller_subscriptions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============ sensitive_data_access_log ============
DROP POLICY IF EXISTS "Only admins can view access logs" ON public.sensitive_data_access_log;
CREATE POLICY "Only admins can view access logs" ON public.sensitive_data_access_log
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ seo_indexing_queue ============
DROP POLICY IF EXISTS "Admins can manage SEO indexing queue" ON public.seo_indexing_queue;
CREATE POLICY "Admins can manage SEO indexing queue" ON public.seo_indexing_queue
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ seo_keywords ============
DROP POLICY IF EXISTS "Admins can manage SEO keywords" ON public.seo_keywords;
CREATE POLICY "Admins can manage SEO keywords" ON public.seo_keywords
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ seo_settings ============
DROP POLICY IF EXISTS "Admins can manage SEO settings" ON public.seo_settings;
CREATE POLICY "Admins can manage SEO settings" ON public.seo_settings
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ sitemap_entries ============
DROP POLICY IF EXISTS "Admins can manage sitemap entries" ON public.sitemap_entries;
CREATE POLICY "Admins can manage sitemap entries" ON public.sitemap_entries
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ subscription_payments ============
DROP POLICY IF EXISTS "Admins can update payments" ON public.subscription_payments;
CREATE POLICY "Admins can update payments" ON public.subscription_payments
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all payments" ON public.subscription_payments;
CREATE POLICY "Admins can view all payments" ON public.subscription_payments
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own payments" ON public.subscription_payments;
CREATE POLICY "Users can view own payments" ON public.subscription_payments
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============ user_roles ============
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "User roles viewable by owner" ON public.user_roles;
CREATE POLICY "User roles viewable by owner" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============ user_subscriptions ============
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============ watchlist ============
DROP POLICY IF EXISTS "Users can manage their watchlist" ON public.watchlist;
CREATE POLICY "Users can manage their watchlist" ON public.watchlist
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============ webhook_logs ============
DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ storage.objects (fix anonymous access) ============
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
CREATE POLICY "Users can delete their own listing images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
CREATE POLICY "Users can update their own listing images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
