-- Update existing admin user to be active and admin
UPDATE public.profiles 
SET 
    role = 'admin',
    is_active = true,
    full_name = COALESCE(full_name, 'Administrador')
WHERE email = 'lisboa.codes@gmail.com';