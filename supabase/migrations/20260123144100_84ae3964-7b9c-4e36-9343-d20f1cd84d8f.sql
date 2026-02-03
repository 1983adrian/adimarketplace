-- Create listing_promotions table for paid and social promotions
CREATE TABLE IF NOT EXISTS public.listing_promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL,
  promotion_type text NOT NULL DEFAULT 'paid' CHECK (promotion_type IN ('paid', 'social_share')),
  platform text, -- for social shares: facebook, instagram, twitter, tiktok
  share_url text,
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  ends_at timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  amount_paid numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listing_promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active promotions"
ON public.listing_promotions FOR SELECT
USING (is_active = true AND ends_at > now());

CREATE POLICY "Sellers can view their own promotions"
ON public.listing_promotions FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can create promotions for their listings"
ON public.listing_promotions FOR INSERT
WITH CHECK (
  auth.uid() = seller_id AND
  EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND seller_id = auth.uid())
);

CREATE POLICY "Admins can manage all promotions"
ON public.listing_promotions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add weekly_promotion fee if not exists
INSERT INTO public.platform_fees (fee_type, amount, is_percentage, description, is_active)
SELECT 'weekly_promotion', 5, false, 'Taxă promovare produs pe homepage (7 zile)', true
WHERE NOT EXISTS (SELECT 1 FROM platform_fees WHERE fee_type = 'weekly_promotion');

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_listing_promotions_active ON public.listing_promotions (is_active, ends_at) WHERE is_active = true;