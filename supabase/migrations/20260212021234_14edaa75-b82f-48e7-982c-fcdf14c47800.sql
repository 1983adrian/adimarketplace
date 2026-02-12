
-- =============================================
-- 1. FIX public_seller_profiles view: Use SECURITY DEFINER mode
-- so anonymous users can browse seller profiles
-- =============================================
DROP VIEW IF EXISTS public.public_seller_profiles;

CREATE VIEW public.public_seller_profiles
WITH (security_invoker = false)
AS
SELECT 
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  store_name,
  is_verified,
  is_seller,
  created_at,
  country,
  get_generalized_location(location) AS location,
  total_sales_count,
  average_rating,
  updated_at
FROM profiles
WHERE is_seller = true 
  AND (is_suspended IS NULL OR is_suspended = false);

GRANT SELECT ON public.public_seller_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_seller_profiles IS 
'Secure SECURITY DEFINER view for public seller profiles. Only exposes safe columns.';

-- =============================================
-- 2. FIX contact_submissions INSERT: restrict to authenticated only
-- with proper validation instead of WITH CHECK (true)
-- =============================================
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

CREATE POLICY "Authenticated users can submit contact form"
ON public.contact_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  name IS NOT NULL AND name != '' AND
  email IS NOT NULL AND email != '' AND
  subject IS NOT NULL AND subject != '' AND
  message IS NOT NULL AND message != ''
);

-- =============================================
-- 3. FIX rate_limits: restrict ALL policy to service_role only
-- =============================================
DROP POLICY IF EXISTS "rate_limits_service_only" ON public.rate_limits;

CREATE POLICY "rate_limits_service_role_only"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =============================================
-- 4. FIX sensitive_data_access_log INSERT: restrict to service_role
-- =============================================
DROP POLICY IF EXISTS "Service role can insert access logs" ON public.sensitive_data_access_log;

CREATE POLICY "Service role can insert access logs"
ON public.sensitive_data_access_log
FOR INSERT
TO service_role
WITH CHECK (true);
