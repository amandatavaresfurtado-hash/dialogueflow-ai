-- Add new system settings for AI providers
INSERT INTO system_settings (setting_key, setting_value) VALUES 
  ('ai_provider', 'openai'),
  ('ai_model', 'gpt-4o-mini'),
  ('groq_api_key', ''),
  ('lmstudio_api_url', 'http://localhost:1234'),
  ('anthropic_api_key', ''),
  ('together_api_key', ''),
  ('gemini_api_key', ''),
  ('groq_model', 'llama-3.1-8b-instant'),
  ('lmstudio_model', 'local-model'),
  ('anthropic_model', 'claude-3-haiku-20240307'),
  ('together_model', 'meta-llama/Llama-2-7b-chat-hf'),
  ('gemini_model', 'gemini-pro')
ON CONFLICT (setting_key) DO NOTHING;