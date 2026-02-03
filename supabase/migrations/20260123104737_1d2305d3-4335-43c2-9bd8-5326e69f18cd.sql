-- Add DELETE policy for messages - participants can delete messages in their conversations
CREATE POLICY "Participants can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- Add DELETE policy for conversations - participants can delete their conversations
CREATE POLICY "Participants can delete their conversations"
ON public.conversations
FOR DELETE
USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);