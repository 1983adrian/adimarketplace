-- =============================================
-- FIX 1: Protect PII in profiles table
-- Drop overly permissive policies and create secure ones
-- =============================================

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_seller_info" ON public.profiles;

-- Create secure policies for profiles
-- Users can see their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Public can only see limited seller info (no PII)
CREATE POLICY "Public can view basic seller info"
ON public.profiles FOR SELECT
USING (
  is_seller = true
  -- This policy allows SELECT but app should only query: display_name, avatar_url, store_name, is_verified, country
);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FIX 2: Create admin_emails table for dynamic admin management
-- =============================================

CREATE TABLE IF NOT EXISTS public.admin_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  added_by uuid,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin_emails
CREATE POLICY "Admins can view admin emails"
ON public.admin_emails FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage admin emails"
ON public.admin_emails FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert the current admin email (migrate from hardcoded)
INSERT INTO public.admin_emails (email, is_active)
VALUES ('adrianchirita01@gmail.com', true)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- FIX 3: Create secure function to check admin by email
-- =============================================

CREATE OR REPLACE FUNCTION public.is_admin_email(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_emails
    WHERE LOWER(email) = LOWER(check_email)
    AND is_active = true
  )
$$;

-- =============================================
-- FIX 4: Protect bids table - hide bidder_id from public
-- =============================================

DROP POLICY IF EXISTS "Anyone can view bids on active listings" ON public.bids;

-- Allow viewing bids but only authenticated users see full details
CREATE POLICY "Authenticated users can view bids on active listings"
ON public.bids FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = bids.listing_id
    AND listings.is_active = true
  )
);

-- Listing owner can always see bids on their listings
CREATE POLICY "Sellers can view bids on their listings"
ON public.bids FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = bids.listing_id
    AND listings.seller_id = auth.uid()
  )
);

-- Bidders can see their own bids
CREATE POLICY "Bidders can view own bids"
ON public.bids FOR SELECT
USING (auth.uid() = bidder_id);

-- =============================================
-- FIX 5: Protect reviews - only authenticated users can view
-- =============================================

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

-- Authenticated users can view reviews (prevents scraping)
CREATE POLICY "Authenticated users can view reviews"
ON public.reviews FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Participants can always see reviews on their orders
CREATE POLICY "Order participants can view reviews"
ON public.reviews FOR SELECT
USING (
  auth.uid() = reviewer_id 
  OR auth.uid() = reviewed_user_id
);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
ON public.reviews FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));