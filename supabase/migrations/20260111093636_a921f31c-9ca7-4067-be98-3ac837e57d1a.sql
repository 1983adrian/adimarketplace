-- Create platform_fees table for admin-configurable fee structure
CREATE TABLE public.platform_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_type TEXT NOT NULL UNIQUE CHECK (fee_type IN ('buyer_fee', 'seller_commission', 'seller_subscription')),
  amount DECIMAL(10, 2) NOT NULL,
  is_percentage BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_fees ENABLE ROW LEVEL SECURITY;

-- Everyone can read fees (needed for checkout calculations)
CREATE POLICY "Anyone can view platform fees"
ON public.platform_fees
FOR SELECT
USING (true);

-- Only admins can modify fees
CREATE POLICY "Admins can insert platform fees"
ON public.platform_fees
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update platform fees"
ON public.platform_fees
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Insert default fee values
INSERT INTO public.platform_fees (fee_type, amount, is_percentage, description)
VALUES 
  ('buyer_fee', 2.00, false, 'Flat fee charged to buyers per transaction (GBP)'),
  ('seller_commission', 20.00, true, 'Percentage commission on each sale'),
  ('seller_subscription', 1.00, false, 'Monthly subscription fee for sellers (GBP)');

-- Create trigger for updated_at
CREATE TRIGGER update_platform_fees_updated_at
BEFORE UPDATE ON public.platform_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create seller_subscriptions table to track subscription status
CREATE TABLE public.seller_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.seller_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.seller_subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- System can insert/update subscriptions (via service role in edge functions)
CREATE POLICY "Service role can manage subscriptions"
ON public.seller_subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_seller_subscriptions_updated_at
BEFORE UPDATE ON public.seller_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();