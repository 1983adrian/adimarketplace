
-- ============================================
-- FIX: Remaining policies with {public} roles
-- Change to TO authenticated (or service_role where needed)
-- ============================================

-- 1. RETURNS: "Sellers can delete finished returns"
DROP POLICY IF EXISTS "Sellers can delete finished returns" ON public.returns;
CREATE POLICY "Sellers can delete finished returns" ON public.returns
FOR DELETE TO authenticated
USING ((auth.uid() = seller_id) AND (status = ANY (ARRAY['completed'::text, 'rejected'::text, 'refunded_no_return'::text, 'cancelled'::text])));

-- 2. WEB_PUSH_SUBSCRIPTIONS: Fix all 5 policies
DROP POLICY IF EXISTS "Service role full access to push subscriptions" ON public.web_push_subscriptions;
CREATE POLICY "Service role full access to push subscriptions" ON public.web_push_subscriptions
FOR SELECT TO service_role
USING (true);

DROP POLICY IF EXISTS "Users can create their own push subscriptions" ON public.web_push_subscriptions;
CREATE POLICY "Users can create their own push subscriptions" ON public.web_push_subscriptions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.web_push_subscriptions;
CREATE POLICY "Users can delete their own push subscriptions" ON public.web_push_subscriptions
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.web_push_subscriptions;
CREATE POLICY "Users can update their own push subscriptions" ON public.web_push_subscriptions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.web_push_subscriptions;
CREATE POLICY "Users can view their own push subscriptions" ON public.web_push_subscriptions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 3. WITHDRAWAL_REQUESTS: Fix all 4 policies
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Admins can update withdrawal requests" ON public.withdrawal_requests
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Admins can view all withdrawal requests" ON public.withdrawal_requests
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can create own withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can create own withdrawal requests" ON public.withdrawal_requests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can view own withdrawal requests" ON public.withdrawal_requests
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 4. STORAGE: Fix remaining storage policies
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
CREATE POLICY "Users can delete their own listing images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
CREATE POLICY "Users can update their own listing images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
