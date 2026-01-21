-- Allow participants to update their conversations (for updating updated_at timestamp)
CREATE POLICY "Participants can update their conversations" 
ON public.conversations 
FOR UPDATE 
USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id))
WITH CHECK ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));