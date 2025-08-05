-- Add missing SELECT policy for conversations table
CREATE POLICY "Active users can view their own conversations" 
ON conversations 
FOR SELECT 
USING ((auth.uid() = user_id) AND is_user_active(auth.uid()));