
-- =============================================
-- CLEAN UP: Remove ALL duplicate/conflicting RLS policies
-- =============================================

-- Drop all existing profiles SELECT policies (duplicates causing issues)
DROP POLICY IF EXISTS "Owner full access to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Seller public data via function only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_or_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_owner_admin_only" ON public.profiles;

-- Drop all existing profiles INSERT policies (duplicates)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_insert" ON public.profiles;

-- Drop all existing profiles UPDATE policies (duplicates)
DROP POLICY IF EXISTS "Owner can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop all existing saved_addresses policies
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_owner_delete" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_owner_insert" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_owner_or_admin_select" ON public.saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_owner_update" ON public.saved_addresses;
DROP POLICY IF EXISTS "Users can add their addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "Users can delete their addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "Users can update their addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "Users can view their addresses" ON public.saved_addresses;

-- =============================================
-- CREATE CLEAN, STRICT RLS POLICIES
-- =============================================

-- PROFILES: Only owner or admin can SELECT (protects all sensitive data)
CREATE POLICY "profiles_strict_select"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- PROFILES: Only owner can INSERT their own profile
CREATE POLICY "profiles_strict_insert"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- PROFILES: Only owner can UPDATE their own profile
CREATE POLICY "profiles_strict_update"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- PROFILES: Admin can also UPDATE any profile
CREATE POLICY "profiles_admin_update"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- SAVED_ADDRESSES: Only owner can SELECT their addresses
CREATE POLICY "saved_addresses_strict_select"
ON public.saved_addresses FOR SELECT
USING (auth.uid() = user_id);

-- SAVED_ADDRESSES: Admin can also view for support purposes
CREATE POLICY "saved_addresses_admin_select"
ON public.saved_addresses FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- SAVED_ADDRESSES: Only owner can INSERT
CREATE POLICY "saved_addresses_strict_insert"
ON public.saved_addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- SAVED_ADDRESSES: Only owner can UPDATE
CREATE POLICY "saved_addresses_strict_update"
ON public.saved_addresses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- SAVED_ADDRESSES: Only owner can DELETE
CREATE POLICY "saved_addresses_strict_delete"
ON public.saved_addresses FOR DELETE
USING (auth.uid() = user_id);

-- Ensure RLS is enabled on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
