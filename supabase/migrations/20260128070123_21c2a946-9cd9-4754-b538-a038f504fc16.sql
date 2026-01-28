-- 1. FIX PROFILES RLS - Remove public exposure of sensitive data
-- Drop the overly permissive policy that exposes all columns
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: owner and admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create restrictive SELECT policy - ONLY owner and admin can see full profile
CREATE POLICY "profiles_select_owner_admin_only"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'admin')
);

-- 2. CREATE TRANSACTIONAL PAYMENT FUNCTION
CREATE OR REPLACE FUNCTION public.process_order_transaction(
  p_listing_id uuid,
  p_buyer_id uuid,
  p_seller_id uuid,
  p_amount numeric,
  p_shipping_address text,
  p_payment_processor varchar,
  p_transaction_id varchar,
  p_buyer_fee numeric,
  p_seller_commission numeric,
  p_payout_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_listing_title text;
BEGIN
  -- Start transaction (implicit in function)
  
  -- 1. Verify listing is still available
  SELECT title INTO v_listing_title
  FROM listings
  WHERE id = p_listing_id
    AND is_active = true
    AND is_sold = false
  FOR UPDATE; -- Lock the row
  
  IF v_listing_title IS NULL THEN
    RAISE EXCEPTION 'Listing is no longer available';
  END IF;
  
  -- 2. Create order
  INSERT INTO orders (
    listing_id,
    buyer_id,
    seller_id,
    amount,
    status,
    shipping_address,
    payment_processor,
    processor_transaction_id,
    processor_status,
    buyer_fee,
    seller_commission,
    payout_amount,
    payout_status
  ) VALUES (
    p_listing_id,
    p_buyer_id,
    p_seller_id,
    p_amount,
    'pending',
    p_shipping_address,
    p_payment_processor,
    p_transaction_id,
    'pending',
    p_buyer_fee,
    p_seller_commission,
    p_payout_amount,
    'pending'
  )
  RETURNING id INTO v_order_id;
  
  -- 3. Mark listing as sold (atomic with order creation)
  UPDATE listings
  SET is_sold = true, is_active = false
  WHERE id = p_listing_id;
  
  -- 4. Create seller payout record
  INSERT INTO seller_payouts (
    seller_id,
    order_id,
    gross_amount,
    platform_commission,
    net_amount,
    status,
    processor,
    payout_method
  ) VALUES (
    p_seller_id,
    v_order_id,
    p_amount - p_buyer_fee,
    p_seller_commission,
    p_payout_amount,
    'pending',
    p_payment_processor,
    'iban'
  );
  
  -- 5. Update seller pending balance
  UPDATE profiles
  SET pending_balance = COALESCE(pending_balance, 0) + p_payout_amount
  WHERE user_id = p_seller_id;
  
  -- 6. Create notification for seller
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_seller_id,
    'new_order',
    '📦 Comandă Nouă!',
    format('Ai o comandă nouă pentru "%s"! Expediază la: %s', v_listing_title, p_shipping_address),
    jsonb_build_object(
      'order_id', v_order_id,
      'listing_id', p_listing_id,
      'needs_tracking', true,
      'shipping_address', p_shipping_address
    )
  );
  
  -- Return success with order details
  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id,
    'listing_title', v_listing_title
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Transaction automatically rolls back
    RAISE EXCEPTION 'Order failed: %', SQLERRM;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.process_order_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_order_transaction TO service_role;