-- Consolidate duplicate saved_addresses policies
-- Keep only the strict/correct ones, remove old duplicates

DROP POLICY IF EXISTS "Users can view their own addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "Buyers can view seller address for approved returns" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_admin_select" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_owner_select" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_owner_delete" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_owner_update" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_owner_insert" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_delete" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_select" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_update" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_admin_access" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_return_buyer_view" ON public.saved_addresses;

-- Recreate clean, non-duplicate policies
CREATE POLICY "saved_addresses_owner_select" ON public.saved_addresses
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "saved_addresses_owner_insert" ON public.saved_addresses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_addresses_owner_update" ON public.saved_addresses
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "saved_addresses_owner_delete" ON public.saved_addresses
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "saved_addresses_admin_access" ON public.saved_addresses
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Return buyer can see seller address ONLY for approved/completed returns
CREATE POLICY "saved_addresses_return_buyer_view" ON public.saved_addresses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM returns
      WHERE (returns.status IN ('approved', 'completed'))
        AND returns.buyer_id = auth.uid()
        AND returns.seller_id = saved_addresses.user_id
    )
  );