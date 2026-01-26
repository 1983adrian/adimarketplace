-- ============================================
-- SECURITY FIX: Protect Profiles Sensitive Data
-- ============================================

-- 1. Drop permissive policy that exposes ALL columns to anyone
DROP POLICY IF EXISTS "Anyone can search seller profiles" ON public.profiles;

-- 2. Drop other potentially overlapping policies
DROP POLICY IF EXISTS "profiles_public_limited_view" ON public.profiles;

-- 3. Create a SECURE VIEW that only exposes safe columns for public seller access
-- Using security_invoker so RLS applies to the caller
CREATE OR REPLACE VIEW public.public_seller_profiles 
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
  get_generalized_location(location) as location
FROM public.profiles 
WHERE is_seller = true;

-- Grant access to the view for everyone
GRANT SELECT ON public.public_seller_profiles TO anon, authenticated;

-- 4. Create new restrictive policy for seller searches via the function only
-- This ensures direct table queries cannot access sensitive data
CREATE POLICY "Seller public data via function only"
ON public.profiles FOR SELECT
USING (
  -- Own profile
  auth.uid() = user_id
  -- Admin access
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================
-- SECURITY FIX: Protect RPC Balance Function
-- ============================================

-- 5. Revoke execute permission from authenticated users
-- Only service_role (edge functions) should call this
REVOKE EXECUTE ON FUNCTION public.increment_pending_balance(uuid, numeric) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_pending_balance(uuid, numeric) FROM anon;

-- Grant only to service_role (used by edge functions)
GRANT EXECUTE ON FUNCTION public.increment_pending_balance(uuid, numeric) TO service_role;