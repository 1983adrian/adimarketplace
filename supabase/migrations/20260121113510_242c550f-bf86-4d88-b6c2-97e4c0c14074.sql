-- Add policy for public profile viewing (limited to non-sensitive data for sellers)
-- This is needed so buyers can see seller display_name and avatar on listings

CREATE POLICY "profiles_public_seller_info" ON public.profiles
  FOR SELECT USING (
    -- Allow viewing basic public seller info (display_name, avatar, store_name) for any seller
    is_seller = true
  );

-- Note: The application should only query specific columns (display_name, avatar_url, store_name, is_verified)
-- and never expose sensitive fields like phone, iban, paypal_email through the API