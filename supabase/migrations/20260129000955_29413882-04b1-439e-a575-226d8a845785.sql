-- Add seller price currency to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS price_currency VARCHAR(3) DEFAULT 'GBP';

-- Add comment for clarity
COMMENT ON COLUMN public.listings.price_currency IS 'Currency in which the seller set the price (RON, GBP, EUR, USD)';