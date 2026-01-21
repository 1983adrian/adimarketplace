-- Fix security issues: Restrict public access to sensitive data

-- 1. Drop existing overly permissive policies on profiles for sensitive data
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 2. Create restricted policies for profiles - only show non-sensitive data publicly
CREATE POLICY "profiles_public_limited_view" ON public.profiles
  FOR SELECT USING (
    -- Allow users to see their own full profile
    auth.uid() = user_id
    OR
    -- Allow admins to see all profiles
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 3. Fix campaign_sends - restrict to admins only
ALTER TABLE public.campaign_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_sends_admin_access" ON public.campaign_sends;
CREATE POLICY "campaign_sends_admin_only" ON public.campaign_sends
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 4. Fix newsletter_subscribers - remove hardcoded email, use proper admin check
DROP POLICY IF EXISTS "Admin can manage newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_select" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_insert" ON public.newsletter_subscribers;

CREATE POLICY "newsletter_admin_only_select" ON public.newsletter_subscribers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "newsletter_admin_only_insert" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "newsletter_admin_only_update" ON public.newsletter_subscribers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "newsletter_admin_only_delete" ON public.newsletter_subscribers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 5. Fix marketing_campaigns - remove hardcoded email, use proper admin check
DROP POLICY IF EXISTS "Admin can manage campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "marketing_campaigns_admin_access" ON public.marketing_campaigns;

CREATE POLICY "marketing_campaigns_admin_only" ON public.marketing_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );