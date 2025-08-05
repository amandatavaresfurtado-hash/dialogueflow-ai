-- Enable realtime for all relevant tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL; 
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.token_transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.token_transactions;