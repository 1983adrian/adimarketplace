-- 1. Recreate order transaction function with PROPER payment flow
-- Orders start as 'payment_pending' and stock is NOT reduced yet
CREATE OR REPLACE FUNCTION process_order_transaction(
  p_listing_id uuid,
  p_buyer_id uuid,
  p_seller_id uuid,
  p_amount numeric,
  p_shipping_address text,
  p_payment_processor text,
  p_transaction_id text,
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
  v_current_quantity int;
BEGIN
  -- 1. Verify listing is still available and has stock
  SELECT title, COALESCE(quantity, 1) 
  INTO v_listing_title, v_current_quantity
  FROM listings
  WHERE id = p_listing_id
    AND is_active = true
    AND is_sold = false
  FOR UPDATE; -- Lock the row
  
  IF v_listing_title IS NULL THEN
    RAISE EXCEPTION 'Listing is no longer available';
  END IF;
  
  IF v_current_quantity < 1 THEN
    RAISE EXCEPTION 'Product is out of stock';
  END IF;
  
  -- 2. Create order with PAYMENT_PENDING status (NOT completed)
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
    'payment_pending', -- CRITICAL: Payment not yet confirmed
    p_shipping_address,
    p_payment_processor,
    p_transaction_id,
    'awaiting_payment', -- Waiting for payment confirmation
    p_buyer_fee,
    p_seller_commission,
    p_payout_amount,
    'pending'
  )
  RETURNING id INTO v_order_id;
  
  -- 3. Reserve 1 unit from stock (decrement temporarily)
  -- This prevents overselling but can be restored if payment fails
  UPDATE listings
  SET quantity = GREATEST(COALESCE(quantity, 1) - 1, 0)
  WHERE id = p_listing_id;
  
  -- 4. Check if this was the last item - mark as sold if so
  UPDATE listings
  SET is_sold = true, is_active = false
  WHERE id = p_listing_id AND COALESCE(quantity, 0) = 0;
  
  -- DO NOT create payout record yet - wait for payment confirmation
  -- DO NOT update seller balance yet - wait for payment confirmation
  
  -- 5. Create notification for seller about PENDING order
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_seller_id,
    'order_pending',
    '🛒 Comandă în așteptare',
    format('O comandă pentru "%s" așteaptă plata. Vei fi notificat când plata este confirmată.', v_listing_title),
    jsonb_build_object(
      'order_id', v_order_id,
      'listing_id', p_listing_id,
      'status', 'payment_pending'
    )
  );
  
  -- Return success with order details
  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id,
    'listing_title', v_listing_title,
    'payment_status', 'pending'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Order failed: %', SQLERRM;
END;
$$;

-- 2. Create function to CONFIRM payment and finalize order
CREATE OR REPLACE FUNCTION confirm_order_payment(
  p_order_id uuid,
  p_transaction_id text,
  p_processor_status text DEFAULT 'confirmed'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_listing_title text;
BEGIN
  -- Get order details
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;
  
  IF v_order.id IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  IF v_order.status != 'payment_pending' THEN
    RAISE EXCEPTION 'Order is not awaiting payment';
  END IF;
  
  -- Get listing title
  SELECT title INTO v_listing_title
  FROM listings WHERE id = v_order.listing_id;
  
  -- 1. Update order status to PENDING (paid, awaiting shipment)
  UPDATE orders
  SET status = 'pending',
      processor_status = p_processor_status,
      processor_transaction_id = COALESCE(p_transaction_id, processor_transaction_id),
      updated_at = now()
  WHERE id = p_order_id;
  
  -- 2. Create seller payout record (NOW that payment is confirmed)
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
    v_order.seller_id,
    p_order_id,
    v_order.amount - v_order.buyer_fee,
    v_order.seller_commission,
    v_order.payout_amount,
    'pending',
    v_order.payment_processor,
    'iban'
  ) ON CONFLICT DO NOTHING;
  
  -- 3. Update seller pending balance (NOW that payment is confirmed)
  UPDATE profiles
  SET pending_balance = COALESCE(pending_balance, 0) + v_order.payout_amount
  WHERE user_id = v_order.seller_id;
  
  -- 4. Notify seller about CONFIRMED payment
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_order.seller_id,
    'new_order',
    '📦 Comandă Confirmată!',
    format('Plata pentru "%s" a fost confirmată! Expediază la: %s', v_listing_title, v_order.shipping_address),
    jsonb_build_object(
      'order_id', p_order_id,
      'listing_id', v_order.listing_id,
      'needs_tracking', true,
      'shipping_address', v_order.shipping_address
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'order_id', p_order_id,
    'status', 'confirmed'
  );
END;
$$;

-- 3. Create function to CANCEL order and restore stock (payment failed)
CREATE OR REPLACE FUNCTION cancel_pending_order(
  p_order_id uuid,
  p_reason text DEFAULT 'Payment failed'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  -- Get order details
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;
  
  IF v_order.id IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  IF v_order.status != 'payment_pending' THEN
    RAISE EXCEPTION 'Only pending payment orders can be cancelled';
  END IF;
  
  -- 1. Update order status to cancelled
  UPDATE orders
  SET status = 'cancelled',
      processor_status = 'payment_failed',
      processor_error = p_reason,
      cancelled_at = now(),
      updated_at = now()
  WHERE id = p_order_id;
  
  -- 2. RESTORE stock to listing
  UPDATE listings
  SET quantity = COALESCE(quantity, 0) + 1,
      is_sold = false,
      is_active = true
  WHERE id = v_order.listing_id;
  
  -- 3. Notify buyer about failed payment
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_order.buyer_id,
    'payment_failed',
    '❌ Plata a eșuat',
    format('Plata pentru comanda ta nu a putut fi procesată. Motiv: %s', p_reason),
    jsonb_build_object(
      'order_id', p_order_id,
      'reason', p_reason
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'order_id', p_order_id,
    'stock_restored', true
  );
END;
$$;