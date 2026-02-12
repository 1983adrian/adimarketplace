
-- Recreate ALL views with security_invoker = true

-- orders_safe
DROP VIEW IF EXISTS public.orders_safe;
CREATE VIEW public.orders_safe WITH (security_invoker = true) AS
SELECT id, listing_id, buyer_id, seller_id, amount, status, created_at, updated_at,
  delivery_confirmed_at, buyer_fee, seller_commission, saved_address_id, shipping_address,
  tracking_number, carrier, payout_status, cancelled_at, refund_amount, refund_status,
  refund_reason, refund_requested_at, refunded_at, dispute_opened_at, dispute_resolved_at,
  dispute_reason, payout_amount, payout_at,
  CASE WHEN has_role(auth.uid(), 'admin') THEN payment_processor ELSE NULL::varchar END AS payment_processor,
  CASE WHEN has_role(auth.uid(), 'admin') THEN processor_transaction_id ELSE NULL::varchar END AS processor_transaction_id,
  CASE WHEN has_role(auth.uid(), 'admin') THEN processor_status ELSE NULL::varchar END AS processor_status,
  CASE WHEN has_role(auth.uid(), 'admin') THEN processor_error ELSE NULL::text END AS processor_error,
  CASE WHEN has_role(auth.uid(), 'admin') THEN refund_transaction_id ELSE NULL::varchar END AS refund_transaction_id,
  CASE WHEN has_role(auth.uid(), 'admin') THEN refunded_by ELSE NULL::uuid END AS refunded_by
FROM orders;

-- orders_active
DROP VIEW IF EXISTS public.orders_active;
CREATE VIEW public.orders_active WITH (security_invoker = true) AS
SELECT id, listing_id, buyer_id, seller_id, amount, status, created_at, updated_at,
  tracking_number, carrier,
  CASE WHEN status IN ('pending', 'paid', 'shipped') THEN shipping_address ELSE NULL::text END AS shipping_address,
  payment_processor, payout_status, delivery_confirmed_at
FROM orders;

-- disputes_safe
DROP VIEW IF EXISTS public.disputes_safe;
CREATE VIEW public.disputes_safe WITH (security_invoker = true) AS
SELECT id, order_id, reporter_id, reported_user_id, created_at, updated_at, reason, description, status, resolution,
  CASE WHEN has_role(auth.uid(), 'admin') THEN admin_notes ELSE NULL::text END AS admin_notes
FROM disputes;

-- profiles_safe
DROP VIEW IF EXISTS public.profiles_safe;
CREATE VIEW public.profiles_safe WITH (security_invoker = true) AS
SELECT id, user_id, display_name, username, avatar_url, bio, location, country,
  is_seller, is_verified, store_name, average_rating, total_sales_count, created_at,
  updated_at, preferred_language, seller_type, business_type, last_activity_at
FROM profiles;

-- fraud_monitoring
DROP VIEW IF EXISTS public.fraud_monitoring;
CREATE VIEW public.fraud_monitoring WITH (security_invoker = true) AS
SELECT fa.id, fa.user_id, fa.alert_type, fa.severity, fa.title, fa.status,
  fa.auto_action_taken, fa.created_at, p.display_name, p.username, p.fraud_score,
  p.is_suspended, p.withdrawal_blocked
FROM fraud_alerts fa LEFT JOIN profiles p ON p.user_id = fa.user_id
WHERE fa.status = 'pending'
ORDER BY CASE fa.severity WHEN 'critical' THEN 1 ELSE 2 END, fa.created_at DESC;

-- public_profiles_view
DROP VIEW IF EXISTS public.public_profiles_view;
CREATE VIEW public.public_profiles_view WITH (security_invoker = true) AS
SELECT user_id, username, display_name, avatar_url, store_name, bio,
  get_generalized_location(location) AS location, country, is_seller, is_verified,
  average_rating, total_sales_count, created_at
FROM profiles p
WHERE is_suspended IS NULL OR is_suspended = false;

-- refunds_safe
DROP VIEW IF EXISTS public.refunds_safe;
CREATE VIEW public.refunds_safe WITH (security_invoker = true) AS
SELECT id, order_id, buyer_id, seller_id, amount, requested_by, status, reason,
  created_at, updated_at, completed_at,
  CASE WHEN has_role(auth.uid(), 'admin') THEN processor ELSE NULL::varchar END AS processor,
  CASE WHEN has_role(auth.uid(), 'admin') THEN processor_refund_id ELSE NULL::varchar END AS processor_refund_id
FROM refunds;

-- seller_payouts_safe
DROP VIEW IF EXISTS public.seller_payouts_safe;
CREATE VIEW public.seller_payouts_safe WITH (security_invoker = true) AS
SELECT id, seller_id, order_id, gross_amount, platform_commission, net_amount, status,
  created_at, processed_at, completed_at, payout_method,
  CASE WHEN has_role(auth.uid(), 'admin') THEN processor_payout_id ELSE NULL::varchar END AS processor_payout_id,
  CASE WHEN has_role(auth.uid(), 'admin') THEN processor_transaction_id ELSE NULL::varchar END AS processor_transaction_id,
  CASE WHEN has_role(auth.uid(), 'admin') THEN payout_reference ELSE NULL::varchar END AS payout_reference,
  CASE WHEN has_role(auth.uid(), 'admin') THEN notes ELSE NULL::text END AS notes,
  CASE WHEN has_role(auth.uid(), 'admin') THEN cancelled_reason ELSE NULL::text END AS cancelled_reason,
  CASE WHEN has_role(auth.uid(), 'admin') THEN processor ELSE NULL::varchar END AS processor
FROM seller_payouts;

-- public_seller_profiles
DROP VIEW IF EXISTS public.public_seller_profiles;
CREATE VIEW public.public_seller_profiles WITH (security_invoker = true) AS
SELECT user_id, username, display_name, avatar_url, bio, store_name, is_verified,
  is_seller, created_at, country, get_generalized_location(location) AS location,
  total_sales_count, average_rating, updated_at
FROM profiles
WHERE is_seller = true AND (is_suspended IS NULL OR is_suspended = false);

-- Grant SELECT permissions
GRANT SELECT ON public.public_seller_profiles TO anon, authenticated;
GRANT SELECT ON public.public_profiles_view TO anon, authenticated;
GRANT SELECT ON public.orders_safe TO authenticated;
GRANT SELECT ON public.orders_active TO authenticated;
GRANT SELECT ON public.disputes_safe TO authenticated;
GRANT SELECT ON public.profiles_safe TO authenticated;
GRANT SELECT ON public.fraud_monitoring TO authenticated;
GRANT SELECT ON public.refunds_safe TO authenticated;
GRANT SELECT ON public.seller_payouts_safe TO authenticated;
