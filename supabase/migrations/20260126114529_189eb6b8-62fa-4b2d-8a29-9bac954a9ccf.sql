-- Add seller suspension and fraud detection columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason text,
ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS suspended_by uuid,
ADD COLUMN IF NOT EXISTS withdrawal_blocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS withdrawal_blocked_reason text,
ADD COLUMN IF NOT EXISTS withdrawal_blocked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS fraud_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS fraud_flags jsonb DEFAULT '[]'::jsonb;

-- Create fraud_alerts table for AI-detected suspicious activities
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    alert_type text NOT NULL, -- 'shill_bidding', 'price_manipulation', 'suspicious_withdrawal', 'multiple_accounts', etc.
    severity text NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'critical'
    title text NOT NULL,
    description text,
    evidence jsonb DEFAULT '[]'::jsonb, -- Array of evidence items
    listing_id uuid REFERENCES public.listings(id),
    related_user_ids uuid[] DEFAULT '{}', -- Other users involved
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'confirmed_fraud', 'false_positive', 'resolved'
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    admin_notes text,
    auto_action_taken text, -- What automatic action was taken
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on fraud_alerts
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage fraud alerts
CREATE POLICY "Admins can manage fraud alerts"
ON public.fraud_alerts
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster fraud detection queries
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_alert_type ON public.fraud_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_profiles_fraud_score ON public.profiles(fraud_score);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);

-- Trigger to update updated_at
CREATE OR REPLACE TRIGGER update_fraud_alerts_updated_at
    BEFORE UPDATE ON public.fraud_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();