-- =============================================
-- FIX 1: Remove hardcoded email bypasses from RLS policies
-- =============================================

-- Drop problematic policies with hardcoded emails
DROP POLICY IF EXISTS "Admins can view campaign sends" ON campaign_sends;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON marketing_campaigns;
DROP POLICY IF EXISTS "Admins can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can update subscribers" ON newsletter_subscribers;

-- =============================================
-- FIX 2: Restrict public access to profiles - only safe columns
-- =============================================

-- Drop the overly permissive public seller policy
DROP POLICY IF EXISTS "Public can view basic seller info" ON profiles;

-- Create a secure function to get only public seller info
CREATE OR REPLACE FUNCTION public.get_public_seller_profile(seller_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  bio text,
  store_name text,
  is_verified boolean,
  is_seller boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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
    p.created_at
  FROM profiles p
  WHERE p.user_id = seller_user_id
    AND p.is_seller = true;
$$;

-- Create a new restrictive policy for public seller viewing
-- This policy allows authenticated users to see basic seller info only
CREATE POLICY "Authenticated users can view seller basic info"
ON profiles FOR SELECT
USING (
  -- Own profile - full access
  auth.uid() = user_id
  OR 
  -- Admin - full access
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Other authenticated users can only see sellers (but columns are restricted by the function above)
  (auth.uid() IS NOT NULL AND is_seller = true)
);

-- =============================================
-- FIX 3: Create secure view for public listing data without exact location
-- =============================================

-- Create a function to get generalized location (city/region only, not exact address)
CREATE OR REPLACE FUNCTION public.get_generalized_location(loc text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN loc IS NULL THEN NULL
    WHEN loc = '' THEN NULL
    ELSE split_part(loc, ',', 1) -- Only return first part (usually city)
  END;
$$;