-- =====================================================
-- FIX: Seller Private Data Exposure Through RLS Policy
-- =====================================================

-- 1. DROP the overly permissive policy that exposes sensitive data
DROP POLICY IF EXISTS "Allow view to read seller public data" ON public.profiles;
DROP POLICY IF EXISTS "Seller profiles restricted to owner and admin" ON public.profiles;

-- 2. Create a SECURE RLS policy for profiles - only owners and admins can see full data
CREATE POLICY "Profiles: owner and admin full access"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id  -- Own profile
  OR has_role(auth.uid(), 'admin'::app_role)  -- Admin access
);

-- 3. Drop and recreate the secure public seller view with ONLY safe fields
DROP VIEW IF EXISTS public.public_seller_profiles;

CREATE VIEW public.public_seller_profiles
WITH (security_invoker = true)
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
  get_generalized_location(location) as location,
  total_sales_count,
  average_rating
FROM public.profiles 
WHERE is_seller = true
  AND (is_suspended IS NULL OR is_suspended = false);

-- 4. Grant public access ONLY to the safe view (not the base table)
GRANT SELECT ON public.public_seller_profiles TO anon, authenticated;

-- 5. DROP and recreate the function with new signature
DROP FUNCTION IF EXISTS public.get_public_seller_profile(uuid);

CREATE FUNCTION public.get_public_seller_profile(seller_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  bio text,
  store_name text,
  is_verified boolean,
  is_seller boolean,
  created_at timestamp with time zone,
  country text,
  location text,
  total_sales_count integer,
  average_rating numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    p.bio,
    p.store_name,
    p.is_verified,
    p.is_seller,
    p.created_at,
    p.country,
    get_generalized_location(p.location) as location,
    p.total_sales_count,
    p.average_rating
  FROM profiles p
  WHERE p.user_id = seller_user_id
    AND p.is_seller = true
    AND (p.is_suspended IS NULL OR p.is_suspended = false);
$$;