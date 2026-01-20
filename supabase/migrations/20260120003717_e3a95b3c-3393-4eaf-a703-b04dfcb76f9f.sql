-- Remove stripe-related columns from profiles and add new payment processor fields
ALTER TABLE public.profiles DROP COLUMN IF EXISTS stripe_account_id;

-- Add new seller payout fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS iban VARCHAR(34),
ADD COLUMN IF NOT EXISTS card_number_last4 VARCHAR(4),
ADD COLUMN IF NOT EXISTS card_holder_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS payout_method VARCHAR(20) DEFAULT 'iban',
ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS kyc_country VARCHAR(50),
ADD COLUMN IF NOT EXISTS business_type VARCHAR(20) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS company_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS company_registration VARCHAR(50),
ADD COLUMN IF NOT EXISTS adyen_account_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS mangopay_user_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS mangopay_wallet_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS payout_balance NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_balance NUMERIC(10,2) DEFAULT 0;

-- Update seller_subscriptions to remove stripe references
ALTER TABLE public.seller_subscriptions 
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS stripe_subscription_id;

-- Add new trial and subscription fields
ALTER TABLE public.seller_subscriptions 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '3 months'),
ADD COLUMN IF NOT EXISTS subscription_amount NUMERIC(10,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS payment_processor VARCHAR(20) DEFAULT 'adyen';

-- Create payment processor settings table
CREATE TABLE IF NOT EXISTS public.payment_processor_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor_name VARCHAR(20) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT false,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  merchant_id VARCHAR(100),
  environment VARCHAR(20) DEFAULT 'sandbox',
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on payment_processor_settings
ALTER TABLE public.payment_processor_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage payment processor settings
CREATE POLICY "Admins can manage payment processor settings"
ON public.payment_processor_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default processors
INSERT INTO public.payment_processor_settings (processor_name, is_active)
VALUES 
  ('adyen', false),
  ('mangopay', false)
ON CONFLICT (processor_name) DO NOTHING;

-- Create seller_payouts table (replacing stripe-based payouts)
CREATE TABLE IF NOT EXISTS public.seller_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  gross_amount NUMERIC(10,2) NOT NULL,
  platform_commission NUMERIC(10,2) NOT NULL,
  net_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payout_method VARCHAR(20),
  payout_reference VARCHAR(100),
  processor VARCHAR(20),
  processor_transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS on seller_payouts
ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own payouts
CREATE POLICY "Sellers can view their own payouts"
ON public.seller_payouts
FOR SELECT
TO authenticated
USING (seller_id = auth.uid());

-- Admins can manage all payouts
CREATE POLICY "Admins can manage all payouts"
ON public.seller_payouts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update orders table to remove stripe reference
ALTER TABLE public.orders 
DROP COLUMN IF EXISTS stripe_payment_intent_id;

-- Add new payment processor fields to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_processor VARCHAR(20),
ADD COLUMN IF NOT EXISTS processor_transaction_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS processor_status VARCHAR(50);

-- Update listings to include shipping cost
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(50);

-- Update trigger for payment_processor_settings
CREATE TRIGGER update_payment_processor_settings_updated_at
BEFORE UPDATE ON public.payment_processor_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();