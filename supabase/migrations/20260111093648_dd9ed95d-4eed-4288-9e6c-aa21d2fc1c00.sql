-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.seller_subscriptions;

-- Users can insert their own subscription record
CREATE POLICY "Users can insert their own subscription"
ON public.seller_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
ON public.seller_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
ON public.seller_subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);