
-- =============================================
-- 1. CONTACT_SUBMISSIONS: Block SELECT for non-admins
-- =============================================
-- Currently only admin ALL and public INSERT exist.
-- Add explicit SELECT deny for non-admins to prevent data harvesting.
CREATE POLICY "Only admins can read contact submissions"
ON public.contact_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 2. FIX check_rate_limit: Remove dynamic SQL injection risk
-- =============================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text, 
  p_window_minutes integer DEFAULT 5, 
  p_max_attempts integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_interval interval;
BEGIN
  -- Validate window_minutes is within safe bounds
  IF p_window_minutes < 1 OR p_window_minutes > 1440 THEN
    RAISE EXCEPTION 'Invalid window minutes: must be between 1 and 1440';
  END IF;
  
  v_interval := make_interval(mins => p_window_minutes);
  
  -- Use parameterized query - no dynamic SQL
  SELECT COUNT(*) INTO v_count
  FROM password_reset_attempts
  WHERE email = p_identifier 
    AND created_at > (now() - v_interval);
  
  RETURN v_count < p_max_attempts;
END;
$function$;

-- =============================================
-- 3. SECURE ENCRYPTION FUNCTIONS: Revoke public EXECUTE
-- =============================================
REVOKE EXECUTE ON FUNCTION public.encrypt_profile_field(text, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrypt_profile_field(bytea, text) FROM public, anon, authenticated;

-- Grant only to service_role (edge functions)
GRANT EXECUTE ON FUNCTION public.encrypt_profile_field(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrypt_profile_field(bytea, text) TO service_role;
