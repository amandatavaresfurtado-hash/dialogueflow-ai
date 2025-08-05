-- Add missing SELECT policy for messages table
CREATE POLICY "Active users can view messages in their conversations" 
ON messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM conversations 
  WHERE conversations.id = messages.conversation_id 
  AND conversations.user_id = auth.uid() 
  AND is_user_active(auth.uid())
));