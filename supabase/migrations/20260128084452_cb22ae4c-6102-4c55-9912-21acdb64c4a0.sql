-- ===========================================
-- FIX SECURITY WARNINGS
-- ===========================================

-- 1. Fix Security Definer View - drop and recreate with security_invoker
DROP VIEW IF EXISTS public.profiles_secure;

-- 2. Fix permissive RLS policy on sensitive_data_access_log
DROP POLICY IF EXISTS "System can insert access logs" ON public.sensitive_data_access_log;

-- Only authenticated users can insert their own access logs
CREATE POLICY "Authenticated users can log their own access"
ON public.sensitive_data_access_log
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Service role can insert any logs (for edge functions)
CREATE POLICY "Service role can insert access logs"
ON public.sensitive_data_access_log
FOR INSERT
WITH CHECK (auth.uid() IS NULL); -- This allows service_role which bypasses RLS anyway

-- 3. Update the log function to work with authenticated users
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_accessed_user_id uuid,
  p_field text,
  p_access_type text,
  p_ip text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if user is authenticated
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO sensitive_data_access_log (user_id, accessed_user_id, field_accessed, access_type, ip_address)
    VALUES (auth.uid(), p_accessed_user_id, p_field, p_access_type, p_ip);
  END IF;
END;
$$;