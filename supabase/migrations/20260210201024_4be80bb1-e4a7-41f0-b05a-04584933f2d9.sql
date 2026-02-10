
-- Table for tracking subscription payments (manual bank transfer)
CREATE TABLE public.subscription_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  plan_type text NOT NULL,
  plan_name text NOT NULL,
  amount_ron numeric NOT NULL,
  max_listings integer,
  status text NOT NULL DEFAULT 'pending', -- pending, confirmed, rejected
  payment_method text DEFAULT 'bank_transfer',
  admin_notes text,
  confirmed_by uuid,
  confirmed_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Users can see their own payments
CREATE POLICY "Users can view own payments"
  ON public.subscription_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create payment requests
CREATE POLICY "Users can create payment requests"
  ON public.subscription_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON public.subscription_payments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update payments (confirm/reject)
CREATE POLICY "Admins can update payments"
  ON public.subscription_payments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for quick lookups
CREATE INDEX idx_sub_payments_user ON public.subscription_payments(user_id);
CREATE INDEX idx_sub_payments_status ON public.subscription_payments(status);

-- Trigger for updated_at
CREATE TRIGGER update_subscription_payments_updated_at
  BEFORE UPDATE ON public.subscription_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
