-- Create disputes table for buyer-seller conflicts
CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID NOT NULL,
    reported_user_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    resolution TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Users can view their own disputes (as reporter or reported)
CREATE POLICY "Users can view their own disputes"
ON public.disputes
FOR SELECT
TO authenticated
USING (reporter_id = auth.uid() OR reported_user_id = auth.uid());

-- Users can create disputes for their orders
CREATE POLICY "Users can create disputes"
ON public.disputes
FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

-- Only admins can update disputes
CREATE POLICY "Admins can manage all disputes"
ON public.disputes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();