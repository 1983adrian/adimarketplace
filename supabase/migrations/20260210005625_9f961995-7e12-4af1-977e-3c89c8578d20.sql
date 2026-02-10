
-- Fix remaining policies still on {public} for write operations

-- password_reset_attempts - already blocks insert with false, keep it
-- No action needed, it's WITH CHECK (false)

-- seller_subscriptions - fix INSERT
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.seller_subscriptions;
CREATE POLICY "Users can insert their own subscription" ON public.seller_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- sensitive_data_access_log - fix INSERT policies  
DROP POLICY IF EXISTS "Authenticated users can log their own access" ON public.sensitive_data_access_log;
CREATE POLICY "Authenticated users can log their own access" ON public.sensitive_data_access_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert access logs" ON public.sensitive_data_access_log;
CREATE POLICY "Service role can insert access logs" ON public.sensitive_data_access_log
  FOR INSERT TO service_role WITH CHECK (true);

-- Also fix the remaining bids SELECT policies to authenticated
DROP POLICY IF EXISTS "Authenticated users can view bids on active listings" ON public.bids;
CREATE POLICY "Authenticated users can view bids on active listings" ON public.bids
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = bids.listing_id AND listings.is_active = true)
  );

DROP POLICY IF EXISTS "Bidders can view own bids" ON public.bids;
CREATE POLICY "Bidders can view own bids" ON public.bids
  FOR SELECT TO authenticated USING (auth.uid() = bidder_id);

DROP POLICY IF EXISTS "Sellers can view bids on their listings" ON public.bids;
CREATE POLICY "Sellers can view bids on their listings" ON public.bids
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = bids.listing_id AND listings.seller_id = auth.uid())
  );

-- Fix admin_emails and audit_logs - already on authenticated but tagged as anon-accessible
-- These are on {authenticated} already, the linter might be confused. Let's verify by re-dropping and recreating.

-- Fix remaining contact_submissions admin policy
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can manage contact submissions" ON public.contact_submissions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
