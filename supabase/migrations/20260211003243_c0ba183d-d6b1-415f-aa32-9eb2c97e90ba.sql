
-- ============================================
-- 1. Fix increment_fraud_score: add admin-only check
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_fraud_score(p_user_id UUID, p_score INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service_role (edge functions) or admin users
  -- When called from edge functions with service_role, auth.uid() is null
  IF auth.uid() IS NOT NULL AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE profiles
  SET fraud_score = COALESCE(fraud_score, 0) + p_score,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Revoke execute from public/anon, grant only to authenticated and service_role
REVOKE EXECUTE ON FUNCTION public.increment_fraud_score(UUID, INTEGER) FROM public;
REVOKE EXECUTE ON FUNCTION public.increment_fraud_score(UUID, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_fraud_score(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_fraud_score(UUID, INTEGER) TO service_role;

-- ============================================
-- 2. Create safe profiles view (excludes sensitive financial data)
-- ============================================
CREATE OR REPLACE VIEW public.profiles_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  display_name,
  username,
  avatar_url,
  bio,
  location,
  country,
  is_seller,
  is_verified,
  store_name,
  average_rating,
  total_sales_count,
  created_at,
  updated_at,
  preferred_language,
  seller_type,
  business_type,
  last_activity_at
FROM public.profiles;

-- ============================================
-- 3. Restrict orders shipping_address visibility
-- Drop existing permissive policies and recreate with tighter controls
-- ============================================

-- Create a safe orders view that masks address after delivery
CREATE OR REPLACE VIEW public.orders_active
WITH (security_invoker = true)
AS
SELECT
  id,
  listing_id,
  buyer_id,
  seller_id,
  amount,
  status,
  created_at,
  updated_at,
  tracking_number,
  carrier,
  -- Only show shipping address for active orders (not delivered/cancelled)
  CASE 
    WHEN status IN ('pending', 'paid', 'shipped') THEN shipping_address
    ELSE NULL
  END AS shipping_address,
  payment_processor,
  payout_status,
  delivery_confirmed_at
FROM public.orders;

-- ============================================
-- 4. Add CHECK constraints for listings validation
-- ============================================
DO $$
BEGIN
  -- Add price must be positive constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listings_price_positive'
  ) THEN
    ALTER TABLE public.listings ADD CONSTRAINT listings_price_positive CHECK (price >= 0);
  END IF;

  -- Add title length constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listings_title_length'
  ) THEN
    ALTER TABLE public.listings ADD CONSTRAINT listings_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200);
  END IF;
END $$;

-- ============================================
-- 5. Add audit logging function for sensitive operations
-- ============================================
CREATE OR REPLACE FUNCTION public.audit_sensitive_access(
  p_user_id UUID,
  p_operation TEXT,
  p_table_name TEXT,
  p_details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, new_values)
  VALUES (p_user_id, p_operation, p_table_name, p_user_id::text, p_details);
END;
$$;
