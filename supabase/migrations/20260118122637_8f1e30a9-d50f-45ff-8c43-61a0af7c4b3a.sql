-- Add stripe_account_id column to profiles for Stripe Connect
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_account_id text;

-- Add stripe_transfer_id column to payouts table for Stripe transfers
ALTER TABLE public.payouts
ADD COLUMN IF NOT EXISTS stripe_transfer_id text;