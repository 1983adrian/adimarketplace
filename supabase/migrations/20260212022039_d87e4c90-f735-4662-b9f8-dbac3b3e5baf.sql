
-- =============================================
-- 1. Revoke anonymous access to get_user_special_status
-- Only authenticated users should check badges
-- =============================================
REVOKE EXECUTE ON FUNCTION public.get_user_special_status(uuid) FROM anon;

-- =============================================
-- 2. Harden storage policies: explicitly restrict to authenticated role
-- Drop and recreate DELETE and UPDATE policies with TO authenticated
-- =============================================
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
CREATE POLICY "Users can delete their own listing images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'listings' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
CREATE POLICY "Users can update their own listing images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listings' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- =============================================
-- 3. Harden upload policy: add file extension validation
-- Only allow common image types
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listings'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND (
    name ~* '\.(jpg|jpeg|png|gif|webp|avif|svg)$'
  )
);

-- =============================================
-- 4. Restrict SELECT on listings bucket to authenticated + anon explicitly
-- (already correct but re-confirm with explicit roles)
-- =============================================
DROP POLICY IF EXISTS "Listing images are publicly accessible" ON storage.objects;
CREATE POLICY "Listing images are publicly accessible"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'listings');
