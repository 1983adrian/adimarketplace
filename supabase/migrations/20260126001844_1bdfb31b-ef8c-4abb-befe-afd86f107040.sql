-- Fix: Change view to use SECURITY INVOKER (safer)
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
  get_generalized_location(location) as location
FROM public.profiles 
WHERE is_seller = true;

-- Grant access to the view for everyone
GRANT SELECT ON public.public_seller_profiles TO anon, authenticated;

-- Add policy to allow the view to access seller profiles
CREATE POLICY "Allow view to read seller public data"
ON public.profiles FOR SELECT
USING (is_seller = true);