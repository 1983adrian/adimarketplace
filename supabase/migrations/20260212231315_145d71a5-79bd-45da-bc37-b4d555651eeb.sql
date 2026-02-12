
-- 1. Fix payment_processor_settings_safe view: remove masked key indicators
DROP VIEW IF EXISTS public.payment_processor_settings_safe;
CREATE VIEW public.payment_processor_settings_safe WITH (security_invoker = true) AS
SELECT 
  id,
  processor_name,
  is_active,
  environment,
  merchant_id,
  webhook_url,
  created_at,
  updated_at
FROM public.payment_processor_settings;

-- 2. Create financial_audit_log table for comprehensive audit trail
CREATE TABLE IF NOT EXISTS public.financial_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  amount NUMERIC,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service_role (Edge Functions) can insert
CREATE POLICY "Service role inserts financial audit logs"
ON public.financial_audit_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only admins can read financial audit logs
CREATE POLICY "Admins can read financial audit logs"
ON public.financial_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- No UPDATE or DELETE allowed (immutable logs)

-- 3. Create auth_audit_log table for authentication events
CREATE TABLE IF NOT EXISTS public.auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  action TEXT NOT NULL,
  success BOOLEAN DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role inserts auth audit logs"
ON public.auth_audit_log
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can read auth audit logs"
ON public.auth_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 4. Add index for fast lookups
CREATE INDEX idx_financial_audit_user_id ON public.financial_audit_log(user_id);
CREATE INDEX idx_financial_audit_created_at ON public.financial_audit_log(created_at DESC);
CREATE INDEX idx_financial_audit_entity ON public.financial_audit_log(entity_type, entity_id);
CREATE INDEX idx_auth_audit_user_id ON public.auth_audit_log(user_id);
CREATE INDEX idx_auth_audit_created_at ON public.auth_audit_log(created_at DESC);
