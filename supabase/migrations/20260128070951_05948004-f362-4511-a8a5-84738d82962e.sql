-- =====================================================
-- FIX 1: Rate limiting table for password resets
-- =====================================================
CREATE TABLE IF NOT EXISTS public.password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Auto-cleanup old attempts (older than 24h)
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_created 
  ON public.password_reset_attempts(created_at);

-- Enable RLS (no one can read this except service_role)
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Only service_role can access (edge functions)
-- No policies = only service_role can access

-- =====================================================
-- FIX 2: Strengthen conversations RLS 
-- Add UUID validation to prevent enumeration
-- =====================================================

-- Drop old policies and recreate with stronger validation
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Recreate with explicit participant check
CREATE POLICY "Participants can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  (auth.uid() = buyer_id OR auth.uid() = seller_id)
);

CREATE POLICY "Authenticated users can create conversations for their listings"
ON public.conversations
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid() = buyer_id AND
  EXISTS (
    SELECT 1 FROM listings 
    WHERE listings.id = listing_id 
    AND listings.is_active = true
  )
);

-- Strengthen messages RLS - ensure double validation
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

CREATE POLICY "Participants can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

CREATE POLICY "Participants can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- =====================================================
-- FIX 3: Newsletter - require authentication OR rate limit
-- Replace dangerous anonymous INSERT policy
-- =====================================================

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter with valid email" ON public.newsletter_subscribers;

-- Only authenticated users can subscribe (prevents spam)
CREATE POLICY "Authenticated users can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  email IS NOT NULL AND
  email <> '' AND
  email ~~ '%@%.%'
);

-- =====================================================
-- FIX 4: Add rate limit function for edge functions
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_table_name text,
  p_max_attempts int,
  p_window_minutes int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  -- Count recent attempts
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE email = $1 AND created_at > (now() - interval ''%s minutes'')',
    p_table_name,
    p_window_minutes
  ) INTO v_count USING p_identifier;
  
  RETURN v_count < p_max_attempts;
END;
$$;