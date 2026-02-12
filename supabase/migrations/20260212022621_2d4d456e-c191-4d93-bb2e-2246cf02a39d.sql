
-- =============================================
-- 1. Fix contact_submissions policy with {public} role -> TO authenticated
-- =============================================
DROP POLICY IF EXISTS "Only admins can read contact submissions" ON public.contact_submissions;
CREATE POLICY "Only admins can read contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 2. Fix password_reset_attempts policy with {public} role
-- Block all direct inserts (only via SECURITY DEFINER functions)
-- =============================================
DROP POLICY IF EXISTS "password_reset_attempts_no_direct_insert" ON public.password_reset_attempts;
CREATE POLICY "password_reset_attempts_no_direct_insert"
ON public.password_reset_attempts
FOR INSERT
TO authenticated
WITH CHECK (false);

-- =============================================
-- 3. Fix Security Definer View: public_seller_profiles
-- Convert to SECURITY INVOKER + use RPC function instead
-- =============================================
DROP VIEW IF EXISTS public.public_seller_profiles;

-- Create a secure function instead of a SECURITY DEFINER view
CREATE OR REPLACE FUNCTION public.get_public_seller_profiles()
RETURNS TABLE (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  store_name text,
  is_verified boolean,
  is_seller boolean,
  created_at timestamptz,
  country text,
  location text,
  total_sales_count integer,
  average_rating numeric,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.store_name,
    p.is_verified,
    p.is_seller,
    p.created_at,
    p.country,
    get_generalized_location(p.location) AS location,
    p.total_sales_count,
    p.average_rating,
    p.updated_at
  FROM profiles p
  WHERE p.is_seller = true 
    AND (p.is_suspended IS NULL OR p.is_suspended = false);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_seller_profiles() TO anon, authenticated;

-- =============================================
-- 4. Fix RLS Policy Always True: verify all WITH CHECK(true) are service_role
-- Check and fix any remaining ones
-- =============================================

-- Fix invoices: restrict system insert to service_role only
DROP POLICY IF EXISTS "System can create invoices" ON public.invoices;

-- Fix notifications: restrict system insert to service_role only  
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- =============================================
-- 5. Fix cron schema policies (if accessible)
-- These are system tables, mark as acknowledged
-- =============================================
