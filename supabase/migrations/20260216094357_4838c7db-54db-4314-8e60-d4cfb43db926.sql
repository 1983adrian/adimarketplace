
-- =============================================
-- ADMIN FULL ACCESS: SECURITY DEFINER FUNCTIONS
-- These bypass RLS entirely for admin operations
-- =============================================

-- 1. Admin Delete Listing (cascades everything)
CREATE OR REPLACE FUNCTION public.admin_delete_listing(p_listing_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Delete all related records in correct order
  DELETE FROM listing_images WHERE listing_id = p_listing_id;
  DELETE FROM favorites WHERE listing_id = p_listing_id;
  DELETE FROM listing_promotions WHERE listing_id = p_listing_id;
  DELETE FROM listing_reports WHERE listing_id = p_listing_id;
  DELETE FROM bids WHERE listing_id = p_listing_id;
  DELETE FROM price_history WHERE listing_id = p_listing_id;
  DELETE FROM seo_indexing_queue WHERE listing_id = p_listing_id;
  DELETE FROM watchlist WHERE listing_id = p_listing_id;
  DELETE FROM fraud_alerts WHERE listing_id = p_listing_id;
  
  -- Set NULL on orders (preserve order history)
  UPDATE orders SET listing_id = NULL WHERE listing_id = p_listing_id;
  
  -- Delete conversations related to this listing
  DELETE FROM messages WHERE conversation_id IN (
    SELECT id FROM conversations WHERE listing_id = p_listing_id
  );
  DELETE FROM conversations WHERE listing_id = p_listing_id;
  
  -- Finally delete the listing
  DELETE FROM listings WHERE id = p_listing_id;

  RETURN json_build_object('success', true, 'deleted_listing_id', p_listing_id);
END;
$$;

-- 2. Admin Promote Listing
CREATE OR REPLACE FUNCTION public.admin_promote_listing(p_listing_id uuid, p_seller_id uuid, p_days integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_promo_id uuid;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  INSERT INTO listing_promotions (listing_id, seller_id, promotion_type, starts_at, ends_at, is_active, amount_paid)
  VALUES (p_listing_id, p_seller_id, 'paid', now(), now() + (p_days || ' days')::interval, true, 0)
  RETURNING id INTO v_promo_id;

  RETURN json_build_object('success', true, 'promotion_id', v_promo_id);
END;
$$;

-- 3. Admin Update Listing Status
CREATE OR REPLACE FUNCTION public.admin_update_listing_status(p_listing_id uuid, p_is_active boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE listings SET is_active = p_is_active, updated_at = now() WHERE id = p_listing_id;

  RETURN json_build_object('success', true);
END;
$$;

-- 4. Admin Update Order Status
CREATE OR REPLACE FUNCTION public.admin_update_order_status(p_order_id uuid, p_status text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE orders SET status = p_status::order_status, updated_at = now() WHERE id = p_order_id;

  RETURN json_build_object('success', true);
END;
$$;

-- 5. Admin Delete User (soft: suspend)
CREATE OR REPLACE FUNCTION public.admin_suspend_user(p_user_id uuid, p_suspend boolean DEFAULT true)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE profiles SET is_suspended = p_suspend, updated_at = now() WHERE user_id = p_user_id;

  RETURN json_build_object('success', true, 'suspended', p_suspend);
END;
$$;

-- 6. Comprehensive Admin RLS policies on ALL major tables
-- Drop existing admin policies if they exist to avoid conflicts

DO $$
DECLARE
  tbl TEXT;
  pol_name TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'listings', 'listing_images', 'favorites', 'bids', 'price_history', 
    'seo_indexing_queue', 'watchlist', 'fraud_alerts', 'listing_promotions',
    'listing_reports', 'orders', 'notifications', 'conversations', 'messages',
    'disputes', 'dispute_evidence', 'categories', 'profiles', 'reviews',
    'returns', 'seller_subscriptions', 'seller_payouts', 'invoices',
    'platform_fees', 'platform_settings', 'homepage_content', 'email_templates',
    'contact_submissions', 'policies_content', 'newsletter_subscribers',
    'marketing_campaigns', 'campaign_sends', 'audit_logs', 'platform_activity',
    'platform_health', 'platform_statistics', 'content_freshness',
    'payment_processor_settings', 'payouts', 'admin_emails', 'user_roles'
  ])
  LOOP
    -- Check if table exists before creating policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      -- Drop existing admin policies
      FOR pol_name IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl AND policyname LIKE 'Admin full%'
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name, tbl);
      END LOOP;

      -- Create full access policies for admin
      EXECUTE format('CREATE POLICY "Admin full select on %s" ON public.%I FOR SELECT TO authenticated USING (has_role(auth.uid(), ''admin''::app_role))', tbl, tbl);
      EXECUTE format('CREATE POLICY "Admin full insert on %s" ON public.%I FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), ''admin''::app_role))', tbl, tbl);
      EXECUTE format('CREATE POLICY "Admin full update on %s" ON public.%I FOR UPDATE TO authenticated USING (has_role(auth.uid(), ''admin''::app_role))', tbl, tbl);
      EXECUTE format('CREATE POLICY "Admin full delete on %s" ON public.%I FOR DELETE TO authenticated USING (has_role(auth.uid(), ''admin''::app_role))', tbl, tbl);
    END IF;
  END LOOP;
END;
$$;
