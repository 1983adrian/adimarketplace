
-- Add Partner ID and BN Code columns for PayPal Commerce Platform compliance
ALTER TABLE public.payment_processor_settings 
ADD COLUMN IF NOT EXISTS partner_id text,
ADD COLUMN IF NOT EXISTS bn_code text;

-- Add comment for documentation
COMMENT ON COLUMN public.payment_processor_settings.partner_id IS 'PayPal Partner/Platform Merchant ID for marketplace integrations';
COMMENT ON COLUMN public.payment_processor_settings.bn_code IS 'PayPal Attribution ID (BN Code) for revenue attribution';
