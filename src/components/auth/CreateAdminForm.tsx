
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

export function CreateAdminForm() {
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const createAdminUser = async () => {
    if (creating) return;
    
    setCreating(true);
    
    try {
      console.log('Checking if admin user already exists...');
      
      // First check if admin user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'lisboa.codes@gmail.com')
        .single();

      if (existingProfile) {
        console.log('Admin user already exists:', existingProfile);
        
        // Update existing user to be admin and active
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            is_active: true 
          })
          .eq('email', 'lisboa.codes@gmail.com');

        if (updateError) {
          console.error('Error updating existing admin profile:', updateError);
          toast({
            title: 'Erro',
            description: 'Erro ao atualizar permissões do usuário existente.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Sucesso',
          description: 'Permissões de administrador atualizadas! Faça login novamente.',
        });
        return;
      }

      console.log('Creating new admin user...');

      // Create the admin user via auth
      const { data, error } = await supabase.auth.signUp({
        email: 'lisboa.codes@gmail.com',
        password: '102424!@#',
        options: {
          data: {
            full_name: 'Administrador',
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Error creating admin user:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível criar o usuário administrador: ' + error.message,
          variant: 'destructive',
        });
        return;
      }

      console.log('Admin user created:', data.user);

      if (data.user) {
        // Wait for the profile to be created by the trigger, then update it
        let attempts = 0;
        const maxAttempts = 10;
        
        const updateProfile = async () => {
          attempts++;
          console.log(`Attempt ${attempts} to update admin profile...`);
          
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching profile:', fetchError);
            if (attempts < maxAttempts) {
              setTimeout(updateProfile, 1000);
              return;
            }
          }

          if (profile) {
            console.log('Profile found, updating to admin:', profile);
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                role: 'admin',
                is_active: true 
              })
              .eq('user_id', data.user.id);

            if (updateError) {
              console.error('Error updating admin profile:', updateError);
            } else {
              console.log('Profile successfully updated to admin');
            }
          } else if (attempts < maxAttempts) {
            console.log('Profile not found yet, retrying...');
            setTimeout(updateProfile, 1000);
          }
        };

        // Start the update process
        setTimeout(updateProfile, 1000);

        toast({
          title: 'Sucesso',
          description: 'Usuário administrador criado! Verifique seu email para confirmar a conta.',
        });
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar usuário administrador',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Criar Usuário Admin
        </CardTitle>
        <CardDescription>
          Crie o usuário administrador do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm"><strong>Email:</strong> lisboa.codes@gmail.com</p>
          <p className="text-sm"><strong>Senha:</strong> 102424!@#</p>
          <p className="text-sm text-muted-foreground">
            Este usuário terá acesso total ao painel administrativo.
          </p>
        </div>
        
        <Button 
          onClick={createAdminUser} 
          disabled={creating}
          className="w-full"
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar/Atualizar Usuário Admin'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
