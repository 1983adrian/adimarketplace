
-- Remove phone column from profiles (no longer used for any functionality)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;

-- Update public_seller_profiles view to ensure it stays in sync
CREATE OR REPLACE VIEW public.public_seller_profiles WITH (security_invoker = true) AS
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
