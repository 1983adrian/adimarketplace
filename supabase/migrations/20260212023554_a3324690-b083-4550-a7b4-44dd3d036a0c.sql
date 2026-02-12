
-- 1. Fix platform_activity: make it private by default, only owner/admin can see
DROP POLICY IF EXISTS "Anyone can view public activity" ON public.platform_activity;
DROP POLICY IF EXISTS "platform_activity_public_read" ON public.platform_activity;

-- Only admins can read all activity
CREATE POLICY "platform_activity_admin_select" ON public.platform_activity
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can only see their own activity
CREATE POLICY "platform_activity_own_select" ON public.platform_activity
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Update is_public default to false
ALTER TABLE public.platform_activity ALTER COLUMN is_public SET DEFAULT false;
UPDATE public.platform_activity SET is_public = false WHERE is_public = true;
