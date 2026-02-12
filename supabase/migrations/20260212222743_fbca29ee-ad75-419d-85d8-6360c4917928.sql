
-- Create a safe view for withdrawal_requests that masks paypal_email
CREATE OR REPLACE VIEW public.withdrawal_requests_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  amount,
  CASE 
    WHEN auth.uid() = user_id THEN 
      CONCAT('••••', RIGHT(paypal_email, 4))
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN paypal_email
    ELSE '••••••••'
  END AS paypal_email_masked,
  status,
  admin_notes,
  processed_at,
  created_at,
  updated_at
FROM withdrawal_requests;

GRANT SELECT ON public.withdrawal_requests_safe TO authenticated;
