
-- Allow buyers to see seller's return address when a return is approved or completed
CREATE POLICY "saved_addresses_return_buyer_view"
ON public.saved_addresses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM returns r
    WHERE r.buyer_id = auth.uid()
      AND r.seller_id = saved_addresses.user_id
      AND r.status IN ('approved', 'completed', 'shipped')
  )
);
