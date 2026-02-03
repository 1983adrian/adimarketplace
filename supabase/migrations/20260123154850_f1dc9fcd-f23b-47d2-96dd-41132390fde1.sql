-- =============================================
-- FIX: Stricter RLS for profiles - hide sensitive columns from other users
-- =============================================

-- Drop the current policy that exposes all columns to authenticated users viewing sellers
DROP POLICY IF EXISTS "Authenticated users can view seller basic info" ON profiles;

-- Create a more restrictive policy:
-- 1. Users can see their OWN full profile
-- 2. Admins can see ALL profiles
-- 3. For OTHER users viewing sellers, they should use get_public_seller_profile() function instead
CREATE POLICY "Users can view own profile or admins can view all"
ON profiles FOR SELECT
USING (
  auth.uid() = user_id
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Note: Public seller info should be accessed via get_public_seller_profile(seller_user_id) function
-- This function only returns: display_name, username, avatar_url, bio, store_name, is_verified, is_seller, created_at