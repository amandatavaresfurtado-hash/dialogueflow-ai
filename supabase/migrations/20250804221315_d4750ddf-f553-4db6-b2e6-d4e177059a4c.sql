-- Create admin user manually in auth.users and profiles
-- First, let's check if the admin user already exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'lisboa.codes@gmail.com';
    
    -- If user doesn't exist, create it
    IF admin_user_id IS NULL THEN
        -- Insert into auth.users (this is a simplified approach)
        -- In production, you should use Supabase's signup process
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'lisboa.codes@gmail.com',
            crypt('102424!@#', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Administrador"}',
            false,
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO admin_user_id;
        
        -- Insert into profiles
        INSERT INTO public.profiles (
            user_id,
            email,
            full_name,
            role,
            is_active
        ) VALUES (
            admin_user_id,
            'lisboa.codes@gmail.com',
            'Administrador',
            'admin',
            true
        );
        
        RAISE NOTICE 'Admin user created successfully with ID: %', admin_user_id;
    ELSE
        -- Update existing user to be admin and active
        UPDATE public.profiles 
        SET 
            role = 'admin',
            is_active = true,
            full_name = COALESCE(full_name, 'Administrador')
        WHERE user_id = admin_user_id;
        
        RAISE NOTICE 'Existing user updated to admin with ID: %', admin_user_id;
    END IF;
END $$;