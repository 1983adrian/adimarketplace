
-- Drop the existing check constraint and add new one with weekly_promotion
ALTER TABLE public.platform_fees DROP CONSTRAINT IF EXISTS platform_fees_fee_type_check;

ALTER TABLE public.platform_fees ADD CONSTRAINT platform_fees_fee_type_check 
CHECK (fee_type IN ('seller_commission', 'buyer_fee', 'seller_subscription', 'weekly_promotion'));

-- Now insert the promotion fee
INSERT INTO public.platform_fees (fee_type, amount, is_percentage, is_active, description)
VALUES ('weekly_promotion', 3, false, true, 'Weekly listing promotion fee - £3/week');
