-- Add seller_type column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS seller_type text DEFAULT 'personal';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.seller_type IS 'Type of seller: personal (occasional) or business (commercial). Determines PayPal account requirements.';