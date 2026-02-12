
-- Fix audit_logs: prevent admin_id impersonation
DROP POLICY IF EXISTS "Authenticated admins can manage audit logs" ON public.audit_logs;

CREATE POLICY "Admins can insert own audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND admin_id = auth.uid()
  );

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
