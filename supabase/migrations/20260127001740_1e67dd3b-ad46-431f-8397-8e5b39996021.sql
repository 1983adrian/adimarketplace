-- 1. Schimbă increment_pending_balance în SECURITY INVOKER cu validare user_id
DROP FUNCTION IF EXISTS public.increment_pending_balance(uuid, numeric);

CREATE OR REPLACE FUNCTION public.increment_pending_balance(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- CRITICAL: Validare că utilizatorul poate modifica doar propriul sold
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify balance for other users';
  END IF;
  
  UPDATE profiles 
  SET pending_balance = COALESCE(pending_balance, 0) + p_amount
  WHERE user_id = p_user_id
    AND user_id = auth.uid(); -- Double check pentru securitate
END;
$$;

-- 2. Creăm o versiune service_role pentru edge functions
CREATE OR REPLACE FUNCTION public.admin_increment_pending_balance(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Această funcție poate fi apelată DOAR de service_role (edge functions)
  -- RLS nu se aplică pentru service_role, deci nu avem nevoie de validare auth.uid()
  UPDATE profiles 
  SET pending_balance = COALESCE(pending_balance, 0) + p_amount
  WHERE user_id = p_user_id;
END;
$$;

-- 3. Revocăm acces la funcția admin pentru utilizatori obișnuiți
REVOKE ALL ON FUNCTION public.admin_increment_pending_balance(uuid, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_increment_pending_balance(uuid, numeric) FROM authenticated;

-- 4. Eliminăm toate politicile RLS existente pentru profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view basic seller info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view any seller profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by owner or admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles updatable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 5. NOUA politică SELECT: Toți văd coloane publice, doar owner vede tot
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
USING (
  -- Owner vede tot propriul profil
  auth.uid() = user_id
  OR
  -- Admins văd tot
  has_role(auth.uid(), 'admin')
  OR
  -- Alții văd doar dacă is_seller (pentru pagini publice de vânzător)
  is_seller = true
);

-- 6. Politica UPDATE: Doar owner poate edita
CREATE POLICY "profiles_update_owner"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Politica UPDATE pentru admins
CREATE POLICY "profiles_update_admin"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 8. Politica INSERT (pentru crearea profilului la signup)
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 9. Creăm un view securizat pentru date publice (fără coloane sensibile)
DROP VIEW IF EXISTS public.public_profiles_view;

CREATE VIEW public.public_profiles_view 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  username,
  display_name,
  avatar_url,
  store_name,
  bio,
  location,
  country,
  is_seller,
  is_verified,
  average_rating,
  total_sales_count,
  created_at
FROM public.profiles
WHERE is_seller = true
  AND (is_suspended IS NULL OR is_suspended = false);

-- 10. Grant access la view-ul public
GRANT SELECT ON public.public_profiles_view TO authenticated;
GRANT SELECT ON public.public_profiles_view TO anon;