-- Fix 1: Invoices - Only authenticated users through edge functions should create invoices
DROP POLICY IF EXISTS "System can create invoices" ON public.invoices;

CREATE POLICY "Authenticated users can create invoices for their orders"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (
  buyer_id = auth.uid() OR seller_id = auth.uid()
);

-- Fix 2: Newsletter - Allow anyone to subscribe but with email validation
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter with valid email"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL AND email != '' AND email LIKE '%@%.%'
);

-- Fix 3: Notifications - Only system/authenticated users can create their own notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can receive notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- Also allow service role to create notifications (for edge functions)
-- This is handled by Supabase service role which bypasses RLS