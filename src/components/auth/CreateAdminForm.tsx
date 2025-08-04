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
      // First check if admin user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'lisboa.codes@gmail.com')
        .single();

      if (existingProfile) {
        toast({
          title: 'Usuário já existe',
          description: 'O usuário administrador já foi criado anteriormente.',
          variant: 'destructive',
        });
        return;
      }

      // Create the admin user via auth
      const { data, error } = await supabase.auth.signUp({
        email: 'lisboa.codes@gmail.com',
        password: '102424!@#',
        options: {
          data: {
            full_name: 'Administrador',
          },
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

      if (data.user) {
        // Update the profile to be admin and active
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            is_active: true 
          })
          .eq('user_id', data.user.id);

        if (updateError) {
          console.error('Error updating admin profile:', updateError);
          toast({
            title: 'Aviso',
            description: 'Usuário criado, mas houve erro ao definir permissões de admin.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Sucesso',
          description: 'Usuário administrador criado com sucesso!',
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
            'Criar Usuário Admin'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}