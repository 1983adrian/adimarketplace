
-- Add trial and blocking fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS seller_trial_started_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_listing_blocked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_buying_blocked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS blocked_reason text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS blocked_at timestamptz DEFAULT NULL;

-- Add expires_at to user_subscriptions for tracking expiry
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS trial_plan boolean DEFAULT false;

-- Create index for quick seller lookup
CREATE INDEX IF NOT EXISTS idx_profiles_seller_trial ON public.profiles (seller_trial_started_at) WHERE is_seller = true;
CREATE INDEX IF NOT EXISTS idx_profiles_listing_blocked ON public.profiles (is_listing_blocked) WHERE is_listing_blocked = true;

-- Allow admins to update blocking fields
CREATE POLICY "Admins can update blocking fields"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
