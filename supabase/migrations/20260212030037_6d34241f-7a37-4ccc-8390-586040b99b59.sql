
-- Drop dependent views first
DROP VIEW IF EXISTS public.profiles_safe CASCADE;
DROP VIEW IF EXISTS public.fraud_monitoring CASCADE;

-- =============================================
-- MASSIVE CLEANUP: Remove all dead/unused columns from profiles
-- =============================================

-- 1. MangoPay columns (replaced by PayPal)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS mangopay_user_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS mangopay_wallet_id;

-- 2. Adyen columns (never used)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS adyen_account_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS adyen_account_holder_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS adyen_balance_account_id;

-- 3. Bank details (PayPal only)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS iban;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS iban_encrypted;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS bic;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS bic_encrypted;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS sort_code;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS sort_code_encrypted;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS account_number;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS account_number_encrypted;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS card_holder_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS card_number_last4;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payout_method;

-- 4. KYC columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS kyc_status;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS kyc_country;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS kyc_submitted_at;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS kyc_verified_at;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS kyc_documents_submitted;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS verification_documents;

-- 5. Personal identity columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS first_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS last_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS birthday;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS nationality;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS country_of_residence;

-- 6. Address columns on profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS address_line1;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS address_line2;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS city;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS region;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS postal_code;

-- 7. Business registration
ALTER TABLE public.profiles DROP COLUMN IF EXISTS business_type;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS company_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS company_registration;

-- Recreate profiles_safe view (without dead columns)
CREATE OR REPLACE VIEW public.profiles_safe WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  display_name,
  username,
  avatar_url,
  bio,
  location,
  country,
  is_seller,
  is_verified,
  store_name,
  average_rating,
  total_sales_count,
  created_at,
  updated_at,
  preferred_language,
  seller_type,
  last_activity_at
FROM profiles;

-- Recreate fraud_monitoring view
CREATE OR REPLACE VIEW public.fraud_monitoring WITH (security_invoker = true) AS
SELECT 
  fa.id,
  fa.user_id,
  fa.alert_type,
  fa.severity,
  fa.title,
  fa.status,
  fa.auto_action_taken,
  fa.created_at,
  p.display_name,
  p.username,
  p.fraud_score,
  p.is_suspended,
  p.withdrawal_blocked
FROM fraud_alerts fa
LEFT JOIN profiles p ON p.user_id = fa.user_id
WHERE fa.status = 'pending'
ORDER BY 
  CASE fa.severity WHEN 'critical' THEN 1 ELSE 2 END,
  fa.created_at DESC;

-- Update public_seller_profiles view
CREATE OR REPLACE VIEW public.public_seller_profiles WITH (security_invoker = true) AS
SELECT 
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  store_name,
  is_verified,
  is_seller,
  created_at,
  country,
  get_generalized_location(location) AS location,
  total_sales_count,
  average_rating,
  updated_at
FROM profiles
WHERE is_seller = true 
  AND (is_suspended IS NULL OR is_suspended = false);
