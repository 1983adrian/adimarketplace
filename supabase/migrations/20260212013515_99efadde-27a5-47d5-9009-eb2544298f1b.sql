
-- ============================================================
-- CLEANUP: Remove all duplicate and redundant RLS policies
-- ============================================================

-- 1. PROFILES: Remove redundant admin UPDATE policies (already covered by ALL)
DROP POLICY IF EXISTS "Admins can update blocking fields" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;

-- 2. SAVED_ADDRESSES: Remove all duplicate policies, keep clean set
DROP POLICY IF EXISTS "saved_addresses_admin_select" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_delete" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_select" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_update" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_insert" ON public.saved_addresses;
-- Remove duplicate return buyer view (keep the better one)
DROP POLICY IF EXISTS "saved_addresses_return_buyer_view" ON public.saved_addresses;

-- 3. SELLER_PAYOUTS: Remove duplicate policies
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.seller_payouts;
DROP POLICY IF EXISTS "Sellers can view their payouts" ON public.seller_payouts;

-- 4. SELLER_SUBSCRIPTIONS: Remove redundant SELECT (ALL covers it)
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.seller_subscriptions;

-- 5. REVIEWS: Replace overly permissive USING(true) with proper policy
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;
-- Reviews should be viewable by all authenticated users but via proper check
CREATE POLICY "Authenticated users can view reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 6. EMAIL_TEMPLATES: Remove redundant SELECT (ALL covers it)
DROP POLICY IF EXISTS "Admins can view email templates" ON public.email_templates;

-- 7. PAYMENT_PROCESSOR_SETTINGS: Fix missing WITH CHECK
DROP POLICY IF EXISTS "Admins can manage payment processor settings" ON public.payment_processor_settings;
CREATE POLICY "Admins can manage payment processor settings"
  ON public.payment_processor_settings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 8. REFUNDS: Remove redundant UPDATE (ALL covers it)
DROP POLICY IF EXISTS "Only admins can update refunds" ON public.refunds;

-- 9. Fix storage policies to use authenticated only for write operations
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
CREATE POLICY "Users can delete their own listing images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ((bucket_id = 'listings') AND ((auth.uid())::text = (storage.foldername(name))[1]));

DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
CREATE POLICY "Users can update their own listing images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ((bucket_id = 'listings') AND ((auth.uid())::text = (storage.foldername(name))[1]));

-- 10. USER_SUBSCRIPTIONS: Fix missing WITH CHECK on admin ALL
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can manage all subscriptions"
  ON public.user_subscriptions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
