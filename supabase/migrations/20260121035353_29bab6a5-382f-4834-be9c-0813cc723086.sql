-- Create webhook_logs table for tracking all payment processor webhooks
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    processor VARCHAR(50) NOT NULL, -- 'mangopay', 'adyen'
    event_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    payload JSONB,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create refunds table for comprehensive refund tracking
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    requested_by UUID NOT NULL,
    processor VARCHAR(50), -- 'mangopay', 'adyen'
    processor_refund_id VARCHAR(255),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to orders table for refund and dispute tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refund_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS refunded_by UUID,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
ADD COLUMN IF NOT EXISTS dispute_opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dispute_resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processor_error TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns to seller_payouts for processor tracking
ALTER TABLE public.seller_payouts
ADD COLUMN IF NOT EXISTS processor_payout_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;

-- Add kyc_submitted_at to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Webhook logs: Only admins can view
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Refunds: Buyers and sellers can view their own, admins can view all
CREATE POLICY "Users can view their refunds" ON public.refunds
    FOR SELECT USING (
        buyer_id = auth.uid() OR 
        seller_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can request refunds for their orders" ON public.refunds
    FOR INSERT WITH CHECK (
        buyer_id = auth.uid() OR 
        seller_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Create index for faster webhook lookup
CREATE INDEX IF NOT EXISTS idx_webhook_logs_resource ON public.webhook_logs(resource_id, event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processor ON public.webhook_logs(processor, created_at);
CREATE INDEX IF NOT EXISTS idx_refunds_order ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);

-- Add trigger for refunds updated_at
CREATE TRIGGER update_refunds_updated_at
    BEFORE UPDATE ON public.refunds
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();