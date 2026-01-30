-- =============================================
-- SECURITY FIX MIGRATION
-- =============================================

-- 1. Fix check_rate_limit function to prevent SQL injection
-- Replace dynamic SQL with safe parameterized approach
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text, 
  p_window_minutes integer DEFAULT 5,
  p_max_attempts integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Safe implementation without dynamic SQL
  -- Check password_reset_attempts table specifically
  SELECT COUNT(*) INTO v_count
  FROM password_reset_attempts
  WHERE email = p_identifier 
    AND created_at > (now() - (p_window_minutes || ' minutes')::interval);
  
  RETURN v_count < p_max_attempts;
END;
$$;

-- 2. Create push notification rate limiting function
CREATE OR REPLACE FUNCTION public.check_push_rate_limit(
  p_user_id uuid,
  p_max_per_hour integer DEFAULT 20
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Count push tokens used in last hour
  SELECT COUNT(*) INTO v_count
  FROM push_tokens
  WHERE user_id = p_user_id
    AND last_used_at > (now() - interval '1 hour');
  
  RETURN v_count < p_max_per_hour;
END;
$$;

-- 3. Add rate limiting tracking table for push notifications
CREATE TABLE IF NOT EXISTS public.push_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  notification_type text,
  success boolean DEFAULT true
);

-- Enable RLS on push_notification_log
ALTER TABLE public.push_notification_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view push notification logs
CREATE POLICY "Admins can manage push logs"
  ON public.push_notification_log
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (for edge functions)
CREATE POLICY "Service role can insert push logs"
  ON public.push_notification_log
  FOR INSERT
  WITH CHECK (true);

-- 4. Create server-side admin verification function for edge functions
CREATE OR REPLACE FUNCTION public.verify_admin_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_is_admin boolean := false;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id;
  
  IF v_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check admin_emails table
  SELECT EXISTS (
    SELECT 1 FROM admin_emails
    WHERE LOWER(email) = LOWER(v_email) AND is_active = true
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN true;
  END IF;
  
  -- Fallback to user_roles
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id AND role = 'admin'
  );
END;
$$;

-- 5. Update RLS policies to require authentication (not just anon)
-- Fix admin_emails policies
DROP POLICY IF EXISTS "Admins can manage admin emails" ON public.admin_emails;
DROP POLICY IF EXISTS "Admins can view admin emails" ON public.admin_emails;

CREATE POLICY "Authenticated admins can manage admin emails"
  ON public.admin_emails
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix audit_logs policies
DROP POLICY IF EXISTS "Admins can create audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated admins can manage audit logs"
  ON public.audit_logs
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Add index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_push_notification_log_user_sent 
  ON push_notification_log(user_id, sent_at);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_last_used 
  ON push_tokens(user_id, last_used_at);

-- 7. Create cleanup function for push notification logs
CREATE OR REPLACE FUNCTION public.cleanup_old_push_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  -- Delete logs older than 30 days
  DELETE FROM push_notification_log 
  WHERE sent_at < (now() - interval '30 days');
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;