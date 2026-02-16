
-- Add merchant_id column to profiles (replaces email-based approach)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS paypal_merchant_id text,
ADD COLUMN IF NOT EXISTS paypal_permissions_granted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS paypal_connected_at timestamptz;

-- Create table for PayPal OAuth tokens (stored securely, only accessible by service_role)
CREATE TABLE IF NOT EXISTS public.paypal_merchant_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  merchant_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.paypal_merchant_tokens ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write tokens (no user access)
CREATE POLICY "Service role manages merchant tokens"
ON public.paypal_merchant_tokens
FOR ALL
USING (false)
WITH CHECK (false);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_paypal_merchant_tokens_user_id ON public.paypal_merchant_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_merchant_tokens_merchant_id ON public.paypal_merchant_tokens(merchant_id);
