-- Fix overly permissive policies - restrict to service_role only

-- 1. Fix notifications system insert (already for service_role, but clarify)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
-- This policy is intentionally permissive for service_role only (edge functions)
-- service_role bypasses RLS anyway, but we document the intent

-- 2. Fix push_notification_log 
DROP POLICY IF EXISTS "Service role can insert push logs" ON public.push_notification_log;
-- service_role bypasses RLS, this policy was redundant

-- 3. Fix security_events
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
-- service_role bypasses RLS, this policy was redundant

-- 4. Add proper authenticated-only policies for admin tables
-- Update admin_emails to restrict to authenticated admins only
DROP POLICY IF EXISTS "Authenticated admins can manage admin emails" ON public.admin_emails;
CREATE POLICY "Authenticated admins can manage admin emails" 
ON public.admin_emails 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Update audit_logs to restrict to authenticated admins only
DROP POLICY IF EXISTS "Authenticated admins can manage audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated admins can manage audit logs" 
ON public.audit_logs 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. Update contact_submissions to restrict to authenticated admins only
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can manage contact submissions" 
ON public.contact_submissions 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7. Allow public contact form submissions (authenticated or anon can submit)
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 8. Update bids policies to use authenticated role
DROP POLICY IF EXISTS "Authenticated users can view bids on active listings" ON public.bids;
CREATE POLICY "Authenticated users can view bids on active listings" 
ON public.bids 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM listings 
  WHERE listings.id = bids.listing_id 
  AND listings.is_active = true
));

DROP POLICY IF EXISTS "Bidders can view own bids" ON public.bids;
CREATE POLICY "Bidders can view own bids" 
ON public.bids 
FOR SELECT 
TO authenticated
USING (auth.uid() = bidder_id);

DROP POLICY IF EXISTS "Sellers can view bids on their listings" ON public.bids;
CREATE POLICY "Sellers can view bids on their listings" 
ON public.bids 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM listings 
  WHERE listings.id = bids.listing_id 
  AND listings.seller_id = auth.uid()
));

-- 9. Update campaign_sends to authenticated only
DROP POLICY IF EXISTS "campaign_sends_admin_only" ON public.campaign_sends;
CREATE POLICY "campaign_sends_admin_only" 
ON public.campaign_sends 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 10. Update marketing_campaigns to authenticated only
DROP POLICY IF EXISTS "marketing_campaigns_admin_only" ON public.marketing_campaigns;
CREATE POLICY "marketing_campaigns_admin_only" 
ON public.marketing_campaigns 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));