-- Add tokens column to profiles table
ALTER TABLE public.profiles ADD COLUMN tokens DECIMAL(10,2) DEFAULT 10.0;

-- Create system_settings table for admin configurations
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system_settings (only admins can access)
CREATE POLICY "Admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
('message_cost_tokens', '0.5'),
('whatsapp_phone', '5579999062129'),
('whatsapp_payment_enabled', 'true'),
('other_payment_url', ''),
('other_payment_enabled', 'false'),
('openai_api_key_display', 'sk-...hidden');

-- Create trigger for system_settings updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create token_transactions table to track token usage
CREATE TABLE public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on token_transactions
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for token_transactions
CREATE POLICY "Users can view their own token transactions" 
ON public.token_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all token transactions" 
ON public.token_transactions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create token transactions" 
ON public.token_transactions 
FOR INSERT 
WITH CHECK (true);