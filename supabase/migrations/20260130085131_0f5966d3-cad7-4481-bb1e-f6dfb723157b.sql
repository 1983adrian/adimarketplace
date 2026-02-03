-- 1. Add DELETE policy for notifications (fixing delete button not working)
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Create a security_log table for platform audit trail
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert security events (via service role)
CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- 3. Create platform_health table for monitoring
CREATE TABLE IF NOT EXISTS public.platform_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  last_check_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_check_at TIMESTAMP WITH TIME ZONE,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_health ENABLE ROW LEVEL SECURITY;

-- Anyone can view platform health
CREATE POLICY "Anyone can view platform health" 
ON public.platform_health 
FOR SELECT 
USING (true);

-- Admins can manage platform health
CREATE POLICY "Admins can manage platform health" 
ON public.platform_health 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_status 
ON public.orders(buyer_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_seller_status 
ON public.orders(seller_id, status);

CREATE INDEX IF NOT EXISTS idx_listings_seller_active 
ON public.listings(seller_id, is_active, is_sold);

-- 5. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_events (event_type, user_id, details)
  VALUES (p_event_type, COALESCE(p_user_id, auth.uid()), p_details);
END;
$$;