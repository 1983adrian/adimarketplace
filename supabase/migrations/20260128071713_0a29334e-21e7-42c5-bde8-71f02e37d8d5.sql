-- =============================================
-- FIX 1: Securizare tabel PROFILES
-- =============================================

-- Ștergem toate politicile vechi de pe profiles pentru a le rescrie corect
DROP POLICY IF EXISTS "profiles_select_owner_admin_only" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Politică SELECT: Doar proprietarul sau admin pot vedea datele complete
CREATE POLICY "profiles_owner_or_admin_select"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin')
);

-- Politică UPDATE: Doar proprietarul poate actualiza
CREATE POLICY "profiles_owner_update"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politică INSERT: Doar utilizatorul autentificat poate crea propriul profil
CREATE POLICY "profiles_owner_insert"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FIX 2: Securizare tabel SAVED_ADDRESSES
-- =============================================

-- Ștergem politicile vechi
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.saved_addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.saved_addresses;

-- Activăm RLS dacă nu e deja activat
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- Politică SELECT: DOAR proprietarul sau admin
CREATE POLICY "saved_addresses_owner_or_admin_select"
ON public.saved_addresses FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin')
);

-- Politică INSERT: Doar proprietarul
CREATE POLICY "saved_addresses_owner_insert"
ON public.saved_addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politică UPDATE: Doar proprietarul
CREATE POLICY "saved_addresses_owner_update"
ON public.saved_addresses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politică DELETE: Doar proprietarul
CREATE POLICY "saved_addresses_owner_delete"
ON public.saved_addresses FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- VIEW SECURIZAT pentru profiluri publice (vânzători)
-- Exclude toate datele sensibile (telefon, IBAN, adrese, KYC)
-- =============================================

-- Recreăm view-ul public_seller_profiles fără date sensibile
DROP VIEW IF EXISTS public.public_seller_profiles;

CREATE VIEW public.public_seller_profiles
WITH (security_invoker = on) AS
SELECT 
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.store_name,
  p.is_verified,
  p.is_seller,
  p.created_at,
  p.country,
  get_generalized_location(p.location) as location,
  p.total_sales_count,
  p.average_rating
FROM profiles p
WHERE p.is_seller = true
  AND (p.is_suspended IS NULL OR p.is_suspended = false);

-- View public pentru orice profil (fără date sensibile)
DROP VIEW IF EXISTS public.public_profiles_view;

CREATE VIEW public.public_profiles_view
WITH (security_invoker = on) AS
SELECT 
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.store_name,
  p.bio,
  get_generalized_location(p.location) as location,
  p.country,
  p.is_seller,
  p.is_verified,
  p.average_rating,
  p.total_sales_count,
  p.created_at
FROM profiles p
WHERE (p.is_suspended IS NULL OR p.is_suspended = false);