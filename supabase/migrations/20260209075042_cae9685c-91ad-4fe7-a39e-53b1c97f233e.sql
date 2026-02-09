-- Fix Security Definer Views - Convert to Security Invoker
-- This ensures RLS policies are enforced based on the querying user

-- 1. Recreate public_seller_profiles with security_invoker
DROP VIEW IF EXISTS public.public_seller_profiles;
CREATE VIEW public.public_seller_profiles
WITH (security_invoker = on) AS
SELECT 
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  store_name,
  is_verified,
  is_seller,
  created_at,
  country,
  get_generalized_location(location) AS location,
  total_sales_count,
  average_rating
FROM profiles p
WHERE is_seller = true 
  AND (is_suspended IS NULL OR is_suspended = false);

-- 2. Recreate orders_safe with security_invoker
DROP VIEW IF EXISTS public.orders_safe;
CREATE VIEW public.orders_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  listing_id,
  buyer_id,
  seller_id,
  amount,
  status,
  created_at,
  updated_at,
  delivery_confirmed_at,
  buyer_fee,
  seller_commission,
  saved_address_id,
  shipping_address,
  tracking_number,
  carrier,
  payout_status,
  cancelled_at,
  refund_amount,
  refund_status,
  refund_reason,
  refund_requested_at,
  refunded_at,
  dispute_opened_at,
  dispute_resolved_at,
  dispute_reason,
  payout_amount,
  payout_at,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN payment_processor ELSE NULL END AS payment_processor,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor_transaction_id ELSE NULL END AS processor_transaction_id,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor_status ELSE NULL END AS processor_status,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor_error ELSE NULL END AS processor_error,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN refund_transaction_id ELSE NULL END AS refund_transaction_id,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN refunded_by ELSE NULL END AS refunded_by
FROM orders;

-- 3. Recreate disputes_safe with security_invoker
DROP VIEW IF EXISTS public.disputes_safe;
CREATE VIEW public.disputes_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  order_id,
  reporter_id,
  reported_user_id,
  created_at,
  updated_at,
  reason,
  description,
  status,
  resolution,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN admin_notes ELSE NULL END AS admin_notes
FROM disputes;

-- 4. Recreate fraud_monitoring with security_invoker
DROP VIEW IF EXISTS public.fraud_monitoring;
CREATE VIEW public.fraud_monitoring
WITH (security_invoker = on) AS
SELECT 
  fa.id,
  fa.user_id,
  fa.alert_type,
  fa.severity,
  fa.title,
  fa.status,
  fa.auto_action_taken,
  fa.created_at,
  p.display_name,
  p.username,
  p.fraud_score,
  p.is_suspended,
  p.withdrawal_blocked
FROM fraud_alerts fa
LEFT JOIN profiles p ON p.user_id = fa.user_id
WHERE fa.status = 'pending'
ORDER BY 
  CASE fa.severity WHEN 'critical' THEN 1 ELSE 2 END,
  fa.created_at DESC;

-- Grant SELECT on views to authenticated users
GRANT SELECT ON public.public_seller_profiles TO authenticated, anon;
GRANT SELECT ON public.orders_safe TO authenticated;
GRANT SELECT ON public.disputes_safe TO authenticated;
GRANT SELECT ON public.fraud_monitoring TO authenticated;