
-- 1. contact_submissions: "Only admins can read" is redundant - ALL admin already covers SELECT
DROP POLICY IF EXISTS "Only admins can read contact submissions" ON public.contact_submissions;

-- 2. refunds: "Only admins can update refunds" is redundant - ALL admin already covers UPDATE
DROP POLICY IF EXISTS "Only admins can update refunds" ON public.refunds;

-- 3. seller_subscriptions: "Admins can view all subscriptions" is redundant - ALL admin already covers SELECT
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.seller_subscriptions;

-- 4. newsletter_subscribers: Replace 4 separate admin policies with single ALL
DROP POLICY IF EXISTS "newsletter_admin_only_delete" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_only_insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_only_select" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_only_update" ON public.newsletter_subscribers;

CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. payment_processor_settings: Replace 4 separate admin policies with single ALL
DROP POLICY IF EXISTS "Admins can delete payment settings" ON public.payment_processor_settings;
DROP POLICY IF EXISTS "Admins can insert payment settings" ON public.payment_processor_settings;
DROP POLICY IF EXISTS "Admins can view payment settings safe" ON public.payment_processor_settings;
DROP POLICY IF EXISTS "Admins can update payment settings" ON public.payment_processor_settings;

CREATE POLICY "Admins can manage payment settings"
ON public.payment_processor_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
