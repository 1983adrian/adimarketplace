-- Fix remaining security issues for profiles and saved_addresses

-- 1. Drop duplicate/conflicting SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_strict_select" ON public.profiles;

-- 2. Create single strict SELECT policy for profiles
CREATE POLICY "profiles_strict_select" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- 3. Ensure profiles INSERT is authenticated only
DROP POLICY IF EXISTS "profiles_strict_insert" ON public.profiles;
CREATE POLICY "profiles_strict_insert" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Ensure profiles UPDATE is authenticated only
DROP POLICY IF EXISTS "profiles_strict_update" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile non-financial" ON public.profiles;
CREATE POLICY "profiles_strict_update" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Drop and recreate saved_addresses policies with proper restrictions
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_select" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_insert" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_update" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_strict_delete" ON public.saved_addresses;
DROP POLICY IF EXISTS "Buyers can view seller address for approved returns" ON public.saved_addresses;

-- 6. Create strict policies for saved_addresses
CREATE POLICY "saved_addresses_owner_select" 
ON public.saved_addresses 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "saved_addresses_owner_insert" 
ON public.saved_addresses 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_addresses_owner_update" 
ON public.saved_addresses 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_addresses_owner_delete" 
ON public.saved_addresses 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 7. Allow buyers to view seller return address ONLY for approved returns
CREATE POLICY "saved_addresses_return_buyer_view" 
ON public.saved_addresses 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM returns r
    WHERE r.seller_id = saved_addresses.user_id
      AND r.buyer_id = auth.uid()
      AND r.status IN ('approved', 'completed', 'refunded_no_return')
  )
);

-- 8. Admin access for saved_addresses
CREATE POLICY "saved_addresses_admin_access" 
ON public.saved_addresses 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));