
-- Add plan_name column to seller_subscriptions
ALTER TABLE public.seller_subscriptions ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'START';

-- Create RPC for subscription revenue (avoids row limits)
CREATE OR REPLACE FUNCTION public.get_subscription_revenue()
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(SUM(subscription_amount), 0)
  FROM seller_subscriptions
  WHERE status = 'active';
$$;
