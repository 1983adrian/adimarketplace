-- Allow buyers to view seller's address when they have an approved return
-- This is needed for the buyer to know where to ship the return

CREATE POLICY "Buyers can view seller address for approved returns"
ON public.saved_addresses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.returns r
    WHERE r.seller_id = saved_addresses.user_id
      AND r.buyer_id = auth.uid()
      AND r.status IN ('approved', 'completed', 'refunded_no_return')
  )
);