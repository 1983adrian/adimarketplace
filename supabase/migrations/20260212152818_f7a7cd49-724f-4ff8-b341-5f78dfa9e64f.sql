
-- 1. CONVERSATIONS: Remove the more permissive INSERT that bypasses listing check
DROP POLICY IF EXISTS "Buyers can start conversations" ON public.conversations;

-- 2. PROFILES: Remove duplicate admin UPDATE policies (ALL already covers them)
DROP POLICY IF EXISTS "Admins can update blocking fields" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;

-- 3. PLATFORM_ACTIVITY: Remove redundant admin SELECT (ALL already covers it)
DROP POLICY IF EXISTS "platform_activity_admin_select" ON public.platform_activity;

-- 4. PLATFORM_FEES: Remove redundant admin INSERT (ALL already covers it)
DROP POLICY IF EXISTS "Admins can insert platform fees" ON public.platform_fees;

-- 5. REVIEWS: Remove redundant SELECT policies (the broad one covers all)
DROP POLICY IF EXISTS "Order participants can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
-- Rename the remaining one for clarity and allow anon too (reviews should be public)
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (true);
