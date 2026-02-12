
-- 1. Drop the overly permissive profiles policy that leaks PII
DROP POLICY IF EXISTS "profiles_public_seller_info" ON public.profiles;

-- 2. Drop the return buyer view policy on saved_addresses that exposes home addresses
DROP POLICY IF EXISTS "saved_addresses_return_buyer_view" ON public.saved_addresses;

-- 3. Ensure only owners can see their own profiles (strict)
DROP POLICY IF EXISTS "profiles_strict_select" ON public.profiles;
CREATE POLICY "profiles_strict_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- 4. Ensure saved_addresses only accessible by owner
DROP POLICY IF EXISTS "Users can view their addresses" ON public.saved_addresses;
CREATE POLICY "Users can view their own addresses" ON public.saved_addresses
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
