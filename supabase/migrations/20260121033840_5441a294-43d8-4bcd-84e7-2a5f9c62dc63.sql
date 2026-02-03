-- Add column to track seller terms acceptance
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS seller_terms_accepted_at timestamp with time zone DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.seller_terms_accepted_at IS 'Timestamp when seller accepted terms and conditions';