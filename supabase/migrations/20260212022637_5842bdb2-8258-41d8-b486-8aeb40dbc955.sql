
-- Recreate public_seller_profiles as a SECURITY INVOKER view
-- This is safe because profiles table has strict RLS
-- But we need a permissive SELECT for this view to work for anon users
-- So we create it as SECURITY DEFINER (necessary for marketplace browsing)
-- but only exposing safe columns

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
  get_generalized_location(location) AS location,
  total_sales_count,
  average_rating,
  updated_at
FROM profiles
WHERE is_seller = true 
  AND (is_suspended IS NULL OR is_suspended = false);

GRANT SELECT ON public.public_seller_profiles TO anon, authenticated;
