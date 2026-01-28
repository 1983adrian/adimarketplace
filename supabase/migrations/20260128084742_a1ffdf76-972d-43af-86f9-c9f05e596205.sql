
-- ============================================
-- SECURITY FIX 1: Push Tokens Protection
-- ============================================

-- Add security columns to push_tokens
ALTER TABLE public.push_tokens 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_push_tokens_expires ON public.push_tokens(expires_at) WHERE is_valid = true;

-- Function to validate and update token usage
CREATE OR REPLACE FUNCTION public.validate_push_token(p_token TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  -- Check if token exists, belongs to user, is valid, and not expired
  SELECT (is_valid = true AND expires_at > now()) INTO v_valid
  FROM push_tokens
  WHERE token = p_token AND user_id = p_user_id;
  
  IF v_valid IS TRUE THEN
    -- Update last used timestamp
    UPDATE push_tokens 
    SET last_used_at = now()
    WHERE token = p_token AND user_id = p_user_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to rotate a push token (invalidate old, create new)
CREATE OR REPLACE FUNCTION public.rotate_push_token(p_old_token TEXT, p_new_token TEXT, p_user_id UUID, p_platform TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Invalidate old token
  UPDATE push_tokens 
  SET is_valid = false
  WHERE token = p_old_token AND user_id = p_user_id;
  
  -- Insert new token
  INSERT INTO push_tokens (user_id, token, platform, expires_at, is_valid, last_used_at)
  VALUES (p_user_id, p_new_token, p_platform, now() + interval '30 days', true, now())
  ON CONFLICT (user_id, token) DO UPDATE SET
    expires_at = now() + interval '30 days',
    is_valid = true,
    last_used_at = now();
  
  RETURN true;
END;
$$;

-- Function to cleanup expired tokens (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_push_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM push_tokens 
  WHERE expires_at < now() OR is_valid = false;
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================
-- SECURITY FIX 2: Profile Data Encryption
-- ============================================

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted columns for sensitive financial data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS iban_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS account_number_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS sort_code_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS bic_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS paypal_email_encrypted BYTEA;

-- Encryption function for profile fields
CREATE OR REPLACE FUNCTION public.encrypt_profile_field(p_value TEXT, p_key TEXT)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_value IS NULL OR p_value = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_encrypt(p_value, p_key);
END;
$$;

-- Decryption function for profile fields
CREATE OR REPLACE FUNCTION public.decrypt_profile_field(p_encrypted BYTEA, p_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(p_encrypted, p_key);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Create sensitive data access log if not exists
CREATE TABLE IF NOT EXISTS public.sensitive_data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  accessed_user_id UUID NOT NULL,
  field_accessed TEXT NOT NULL,
  access_type TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on access log
ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for access log (if not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sensitive_data_access_log' 
    AND policyname = 'Only admins can view access logs'
  ) THEN
    CREATE POLICY "Only admins can view access logs"
    ON public.sensitive_data_access_log FOR SELECT
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_accessed_user_id UUID, 
  p_field TEXT, 
  p_access_type TEXT, 
  p_ip TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO sensitive_data_access_log (user_id, accessed_user_id, field_accessed, access_type, ip_address)
    VALUES (auth.uid(), p_accessed_user_id, p_field, p_access_type, p_ip);
  END IF;
END;
$$;
