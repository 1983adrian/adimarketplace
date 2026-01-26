-- =====================================================
-- SECURITY FIX: Create safe views to mask sensitive data
-- =====================================================

-- Create a view that hides admin_notes from non-admins for disputes
CREATE OR REPLACE VIEW public.disputes_safe AS
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

-- Create a secure view for seller payouts - masks processor details
CREATE OR REPLACE VIEW public.seller_payouts_safe AS
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

-- Create a secure view for refunds - masks processor details
CREATE OR REPLACE VIEW public.refunds_safe AS
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

-- Create a secure view for orders - masks processor details
CREATE OR REPLACE VIEW public.orders_safe AS
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
  -- Hide processor details from non-admins
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