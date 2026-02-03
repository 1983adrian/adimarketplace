-- ===========================================
-- PROFILES SECURE VIEW (corected syntax)
-- ===========================================

-- Create secure view for profiles that masks sensitive data
CREATE OR REPLACE VIEW public.profiles_secure AS
SELECT 
  id,
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  store_name,
  location,
  country,
  phone,
  is_seller,
  is_verified,
  is_suspended,
  average_rating,
  total_sales_count,
  payout_balance,
  pending_balance,
  payout_method,
  kyc_status,
  kyc_submitted_at,
  kyc_verified_at,
  created_at,
  updated_at,
  last_activity_at,
  -- Mask sensitive fields - only show last 4 chars
  CASE WHEN iban IS NOT NULL THEN '****' || RIGHT(iban, 4) ELSE NULL END as iban_masked,
  CASE WHEN account_number IS NOT NULL THEN '****' || RIGHT(account_number, 4) ELSE NULL END as account_number_masked,
  CASE WHEN sort_code IS NOT NULL THEN '**-**-' || RIGHT(REPLACE(sort_code, '-', ''), 2) ELSE NULL END as sort_code_masked,
  card_number_last4
FROM public.profiles;

-- Update RLS to be more restrictive for financial columns
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile non-financial"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins full access
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create audit log for sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  accessed_user_id uuid NOT NULL,
  field_accessed text NOT NULL,
  access_type text NOT NULL,
  ip_address text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view access logs" ON public.sensitive_data_access_log;
CREATE POLICY "Only admins can view access logs"
ON public.sensitive_data_access_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can insert access logs" ON public.sensitive_data_access_log;
CREATE POLICY "System can insert access logs"
ON public.sensitive_data_access_log
FOR INSERT
WITH CHECK (true);

-- Function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_user_id uuid,
  p_accessed_user_id uuid,
  p_field text,
  p_access_type text,
  p_ip text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO sensitive_data_access_log (user_id, accessed_user_id, field_accessed, access_type, ip_address)
  VALUES (p_user_id, p_accessed_user_id, p_field, p_access_type, p_ip);
END;
$$;