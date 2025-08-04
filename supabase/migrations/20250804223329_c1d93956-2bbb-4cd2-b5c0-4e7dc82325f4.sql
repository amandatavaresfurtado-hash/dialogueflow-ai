-- Ativar automaticamente o usuário lisboa.codes@gmail.com como admin ativo
UPDATE public.profiles 
SET 
  role = 'admin',
  is_active = true,
  updated_at = now()
WHERE email = 'lisboa.codes@gmail.com';