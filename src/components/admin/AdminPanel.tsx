import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile, UserProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, UserCheck, UserX } from 'lucide-react';

export function AdminPanel() {
  const { profile, isAdmin } = useProfile();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar a lista de usuários',
            variant: 'destructive',
          });
          return;
        }

        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, toast]);

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o status do usuário',
          variant: 'destructive',
        });
        return;
      }

      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId 
            ? { ...user, is_active: isActive }
            : user
        )
      );

      toast({
        title: 'Sucesso',
        description: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o papel do usuário',
          variant: 'destructive',
        });
        return;
      }

      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId 
            ? { ...user, role }
            : user
        )
      );

      toast({
        title: 'Sucesso',
        description: `Papel do usuário atualizado para ${role}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <UserX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar o painel administrativo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.is_active).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie usuários e permissões do sistema
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
          <CardDescription>
            Ative/desative usuários e gerencie suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando usuários...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{user.full_name || 'Sem nome'}</span>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.is_active ? 'default' : 'destructive'}>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <label htmlFor={`active-${user.id}`} className="text-sm">
                        Ativo
                      </label>
                      <Switch
                        id={`active-${user.id}`}
                        checked={user.is_active}
                        onCheckedChange={(checked) => 
                          updateUserStatus(user.user_id, checked)
                        }
                      />
                    </div>

                    {user.user_id !== profile?.user_id && (
                      <Button
                        variant={user.role === 'admin' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => 
                          updateUserRole(
                            user.user_id, 
                            user.role === 'admin' ? 'user' : 'admin'
                          )
                        }
                      >
                        {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center p-6">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}