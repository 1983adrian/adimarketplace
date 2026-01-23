-- Fix refunds table: add proper FK and update RLS

-- Allow admins to manage refunds (update/delete)
CREATE POLICY "Admins can manage all refunds"
ON public.refunds FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'::app_role
));

-- Allow updates to refunds for processing
CREATE POLICY "Admins can update refund status"
ON public.refunds FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'::app_role
));

-- Add partially_refunded to order_status enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partially_refunded' AND enumtypid = 'order_status'::regtype) THEN
    ALTER TYPE order_status ADD VALUE 'partially_refunded';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'refund_pending' AND enumtypid = 'order_status'::regtype) THEN
    ALTER TYPE order_status ADD VALUE 'refund_pending';
  END IF;
END $$;