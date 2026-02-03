-- Add tracking and payout fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payout_amount NUMERIC,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payout_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS buyer_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS seller_commission NUMERIC DEFAULT 0;

-- Create a table to track payouts
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID NOT NULL,
  gross_amount NUMERIC NOT NULL,
  buyer_fee NUMERIC NOT NULL DEFAULT 0,
  seller_commission NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paypal_payout_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own payouts
CREATE POLICY "Sellers can view their payouts"
ON public.payouts
FOR SELECT
USING (auth.uid() = seller_id);

-- Admins can manage all payouts
CREATE POLICY "Admins can manage all payouts"
ON public.payouts
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_payouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON public.payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_payouts_updated_at();