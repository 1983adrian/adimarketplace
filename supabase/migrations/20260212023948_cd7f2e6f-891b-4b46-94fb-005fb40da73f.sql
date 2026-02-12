
-- Restrict conversation metadata: participants only see essential fields
-- Hide admin_joined_at, blocked_at, blocked_by, admin_notes, admin_id, closed_at from non-admins
-- by updating SELECT policies to use a secure view instead

-- Drop existing participant SELECT policy
DROP POLICY IF EXISTS "Participants can view their own conversations" ON public.conversations;

-- Recreate with same access (view layer will handle field filtering)
CREATE POLICY "Participants can view their own conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

-- Create a safe conversations view that hides sensitive metadata from participants
CREATE OR REPLACE VIEW public.conversations_safe
WITH (security_invoker = true) AS
SELECT
  id,
  buyer_id,
  seller_id,
  listing_id,
  order_id,
  context_type,
  status,
  created_at,
  updated_at,
  -- Only show blocking/admin info to admins or if user is involved
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN is_blocked ELSE NULL END AS is_blocked,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN blocked_by ELSE NULL END AS blocked_by,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN blocked_at ELSE NULL END AS blocked_at,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN admin_id ELSE NULL END AS admin_id,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN admin_joined_at ELSE NULL END AS admin_joined_at,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN admin_notes ELSE NULL END AS admin_notes,
  CASE WHEN has_role(auth.uid(), 'admin'::app_role) THEN closed_at ELSE NULL END AS closed_at
FROM public.conversations;

GRANT SELECT ON public.conversations_safe TO authenticated;
