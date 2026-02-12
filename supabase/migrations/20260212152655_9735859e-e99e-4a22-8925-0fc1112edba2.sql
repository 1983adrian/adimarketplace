
-- Remove the policy that allows admins to insert audit logs directly
DROP POLICY IF EXISTS "Admins can insert own audit logs" ON public.audit_logs;

-- Only service_role (Edge Functions) can insert audit logs
CREATE POLICY "Only service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);
