-- Add seller_payouts table for complete escrow tracking
CREATE TABLE IF NOT EXISTS public.seller_payouts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    gross_amount NUMERIC NOT NULL,
    platform_commission NUMERIC NOT NULL DEFAULT 0,
    net_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    processor TEXT,
    processor_payout_id TEXT,
    payout_method TEXT DEFAULT 'iban',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;

-- Policies for seller_payouts
CREATE POLICY "Sellers can view their payouts" 
ON public.seller_payouts FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage payouts"
ON public.seller_payouts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to increment fraud score
CREATE OR REPLACE FUNCTION public.increment_fraud_score(p_user_id UUID, p_score INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET 
    fraud_score = COALESCE(fraud_score, 0) + p_score,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Auto-suspend if score exceeds threshold
  IF (SELECT fraud_score FROM profiles WHERE user_id = p_user_id) >= 100 THEN
    UPDATE profiles
    SET 
      is_suspended = true,
      suspension_reason = 'Scor fraudă ridicat - suspendare automată',
      suspended_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Add dispute_evidence table for organized evidence storage
CREATE TABLE IF NOT EXISTS public.dispute_evidence (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;

-- Policies for dispute_evidence
CREATE POLICY "Users can upload evidence to their disputes"
ON public.dispute_evidence FOR INSERT
WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
        SELECT 1 FROM disputes 
        WHERE id = dispute_id 
        AND (reporter_id = auth.uid() OR reported_user_id = auth.uid())
    )
);

CREATE POLICY "Participants can view evidence"
ON public.dispute_evidence FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM disputes 
        WHERE id = dispute_id 
        AND (reporter_id = auth.uid() OR reported_user_id = auth.uid())
    )
    OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can manage evidence"
ON public.dispute_evidence FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add IP tracking to audit logs if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'device_fingerprint') THEN
        ALTER TABLE public.audit_logs ADD COLUMN device_fingerprint TEXT;
    END IF;
END $$;

-- Create real-time fraud monitoring view
CREATE OR REPLACE VIEW public.fraud_monitoring AS
SELECT 
    fa.id,
    fa.user_id,
    fa.alert_type,
    fa.severity,
    fa.title,
    fa.status,
    fa.auto_action_taken,
    fa.created_at,
    p.display_name,
    p.username,
    p.fraud_score,
    p.is_suspended,
    p.withdrawal_blocked
FROM fraud_alerts fa
LEFT JOIN profiles p ON p.user_id = fa.user_id
WHERE fa.status = 'pending'
ORDER BY 
    CASE fa.severity WHEN 'critical' THEN 1 ELSE 2 END,
    fa.created_at DESC;

-- Add index for faster fraud queries
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status_severity ON fraud_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_profiles_fraud_score ON profiles(fraud_score) WHERE fraud_score > 0;
CREATE INDEX IF NOT EXISTS idx_orders_dispute ON orders(dispute_opened_at) WHERE dispute_opened_at IS NOT NULL;