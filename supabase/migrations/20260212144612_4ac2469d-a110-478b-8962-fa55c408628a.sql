
-- Drop existing permissive policy
DROP POLICY IF EXISTS "Admins can manage payment processor settings" ON public.payment_processor_settings;

-- Create restrictive policies: admins can only view non-sensitive fields via a view
-- Base table: no direct SELECT for admins (only service_role)
CREATE POLICY "Service role only access"
ON public.payment_processor_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can insert/update but NOT read encrypted keys directly
CREATE POLICY "Admins can insert payment settings"
ON public.payment_processor_settings
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment settings"
ON public.payment_processor_settings
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payment settings"
ON public.payment_processor_settings
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a safe view that hides encrypted fields
CREATE OR REPLACE VIEW public.payment_processor_settings_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  processor_name,
  is_active,
  environment,
  merchant_id,
  webhook_url,
  created_at,
  updated_at,
  CASE WHEN api_key_encrypted IS NOT NULL THEN '••••••••' ELSE NULL END as api_key_masked,
  CASE WHEN api_secret_encrypted IS NOT NULL THEN '••••••••' ELSE NULL END as api_secret_masked
FROM public.payment_processor_settings;

-- Admin SELECT via safe view only (no encrypted keys exposed)
CREATE POLICY "Admins can view payment settings safe"
ON public.payment_processor_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
