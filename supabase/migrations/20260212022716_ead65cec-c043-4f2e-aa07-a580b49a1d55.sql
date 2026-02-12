
-- Move pgcrypto extension from public to extensions schema
-- This fixes the "Extension in Public" warning
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop and recreate in extensions schema
DROP EXTENSION IF EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Update encrypt/decrypt functions to use extensions schema
CREATE OR REPLACE FUNCTION public.encrypt_profile_field(p_value text, p_key text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  IF p_value IS NULL OR p_value = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_encrypt(p_value, p_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_profile_field(p_encrypted bytea, p_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
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

-- Keep permissions restricted
REVOKE EXECUTE ON FUNCTION public.encrypt_profile_field(text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encrypt_profile_field(text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.decrypt_profile_field(bytea, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrypt_profile_field(bytea, text) TO service_role;
