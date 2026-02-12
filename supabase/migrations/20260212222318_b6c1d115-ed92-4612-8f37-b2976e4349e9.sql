-- 1. Restrict reviews to only authenticated users (not public)
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

CREATE POLICY "Authenticated users can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- 2. Remove location field values from all listings (cleanup)
UPDATE public.listings SET location = NULL WHERE location IS NOT NULL;