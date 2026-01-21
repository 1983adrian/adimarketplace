-- Add COD (Cash on Delivery / Ramburs) fields to listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS cod_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cod_fee_percentage numeric DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS cod_fixed_fee numeric DEFAULT 5,
ADD COLUMN IF NOT EXISTS cod_transport_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS seller_country text DEFAULT NULL;

-- Add seller country to profiles for eligibility check
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country text DEFAULT NULL;

COMMENT ON COLUMN public.listings.cod_enabled IS 'Whether Cash on Delivery (Ramburs) is enabled for this listing';
COMMENT ON COLUMN public.listings.cod_fee_percentage IS 'Courier COD commission percentage (typically 1-3%)';
COMMENT ON COLUMN public.listings.cod_fixed_fee IS 'Fixed courier fee for COD service';
COMMENT ON COLUMN public.listings.cod_transport_fee IS 'Transport cost for COD delivery';
COMMENT ON COLUMN public.profiles.country IS 'Seller country for COD eligibility (Romania only)';