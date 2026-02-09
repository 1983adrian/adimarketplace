-- SECURITY IMPROVEMENTS: Strengthen RLS policies and add additional protections

-- 1. Add admin policy for orders (missing currently)
CREATE POLICY "Admins can manage all orders" 
ON public.orders 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Restrict notifications INSERT to authenticated only (was public)
DROP POLICY IF EXISTS "Users can receive notifications" ON public.notifications;
CREATE POLICY "Users can receive notifications" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Restrict notifications DELETE to authenticated only
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 4. Restrict notifications UPDATE to authenticated only
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Restrict notifications SELECT to authenticated only
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 6. Add system insert policy for notifications (for edge functions)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- 7. Ensure orders INSERT is restricted to authenticated
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- 8. Ensure orders UPDATE is restricted to authenticated
DROP POLICY IF EXISTS "Participants can update orders" ON public.orders;
CREATE POLICY "Participants can update orders" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

-- 9. Ensure orders SELECT is restricted to authenticated
DROP POLICY IF EXISTS "Users can view their orders" ON public.orders;
CREATE POLICY "Users can view their orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

-- 10. Add rate limiting tracking table for additional security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action_type text NOT NULL,
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action_type)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service_role can access rate_limits (backend only)
CREATE POLICY "rate_limits_service_only"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 11. Add security audit function for tracking sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operation(
  p_operation text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_events (
    event_type,
    user_id,
    details
  ) VALUES (
    p_operation,
    auth.uid(),
    jsonb_build_object(
      'table', p_table_name,
      'record_id', p_record_id,
      'details', p_details,
      'timestamp', now()
    )
  );
END;
$$;

-- 12. Add index for faster security event lookups
CREATE INDEX IF NOT EXISTS idx_security_events_user_timestamp 
ON public.security_events(user_id, created_at DESC);

-- 13. Add index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
ON public.rate_limits(identifier, action_type, window_start);