-- Allow sellers to delete finished returns
CREATE POLICY "Sellers can delete finished returns"
ON public.returns
FOR DELETE
USING (
  auth.uid() = seller_id 
  AND status IN ('completed', 'rejected', 'refunded_no_return', 'cancelled')
);