-- Add quantity and variant columns to listings table
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS available_variants jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0;

-- Add index for quantity filtering
CREATE INDEX IF NOT EXISTS idx_listings_quantity ON public.listings (quantity) WHERE quantity > 0;