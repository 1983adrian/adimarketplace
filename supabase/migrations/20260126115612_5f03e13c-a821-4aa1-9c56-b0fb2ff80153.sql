-- =====================================================
-- FIX: Convert views to SECURITY INVOKER (respects RLS of querying user)
-- =====================================================

-- Drop and recreate views with SECURITY INVOKER
DROP VIEW IF EXISTS public.disputes_safe;
DROP VIEW IF EXISTS public.seller_payouts_safe;
DROP VIEW IF EXISTS public.refunds_safe;
DROP VIEW IF EXISTS public.orders_safe;

-- Disputes safe view with SECURITY INVOKER
CREATE VIEW public.disputes_safe 
WITH (security_invoker = true) AS
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
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN admin_notes
    ELSE NULL
  END as admin_notes
FROM public.disputes;

-- Seller payouts safe view with SECURITY INVOKER
CREATE VIEW public.seller_payouts_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  seller_id,
  order_id,
  gross_amount,
  platform_commission,
  net_amount,
  status,
  created_at,
  processed_at,
  completed_at,
  payout_method,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor_payout_id
    ELSE NULL
  END as processor_payout_id,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor_transaction_id
    ELSE NULL
  END as processor_transaction_id,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN payout_reference
    ELSE NULL
  END as payout_reference,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN notes
    ELSE NULL
  END as notes,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN cancelled_reason
    ELSE NULL
  END as cancelled_reason,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor
    ELSE NULL
  END as processor
FROM public.seller_payouts;

-- Refunds safe view with SECURITY INVOKER
CREATE VIEW public.refunds_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  order_id,
  buyer_id,
  seller_id,
  amount,
  requested_by,
  status,
  reason,
  created_at,
  updated_at,
  completed_at,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor
    ELSE NULL
  END as processor,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor_refund_id
    ELSE NULL
  END as processor_refund_id
FROM public.refunds;

-- Orders safe view with SECURITY INVOKER
CREATE VIEW public.orders_safe 
WITH (security_invoker = true) AS
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
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN payment_processor
    ELSE NULL
  END as payment_processor,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor_transaction_id
    ELSE NULL
  END as processor_transaction_id,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor_status
    ELSE NULL
  END as processor_status,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN processor_error
    ELSE NULL
  END as processor_error,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN refund_transaction_id
    ELSE NULL
  END as refund_transaction_id,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN refunded_by
    ELSE NULL
  END as refunded_by
FROM public.orders;

-- Grant access to authenticated users
GRANT SELECT ON public.disputes_safe TO authenticated;
GRANT SELECT ON public.seller_payouts_safe TO authenticated;
GRANT SELECT ON public.refunds_safe TO authenticated;
GRANT SELECT ON public.orders_safe TO authenticated;