import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile, UserProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Users, 
  UserCheck, 
  UserX, 
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateUserForm {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

interface EditUserForm {
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

export function UsersManager() {
  const { profile, isAdmin } = useProfile();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    isActive: true,
  });

  const [editForm, setEditForm] = useState<EditUserForm>({
    email: '',
    fullName: '',
    role: 'user',
    isActive: true,
  });

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

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

  const createUser = async () => {
    if (!createForm.email || !createForm.password) {
      toast({
        title: 'Erro',
        description: 'Email e senha são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
        options: {
          data: {
            full_name: createForm.fullName,
          },
        },
      });

      if (authError) {
        console.error('Error creating user:', authError);
        toast({
          title: 'Erro',
          description: 'Não foi possível criar o usuário: ' + authError.message,
          variant: 'destructive',
        });
        return;
      }

      if (authData.user) {
        // Update the profile with the correct role and active status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: createForm.role,
            is_active: createForm.isActive,
            full_name: createForm.fullName,
          })
          .eq('user_id', authData.user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          toast({
            title: 'Aviso',
            description: 'Usuário criado, mas houve erro ao configurar o perfil',
            variant: 'destructive',
          });
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário criado com sucesso',
      });

      setCreateForm({
        email: '',
        password: '',
        fullName: '',
        role: 'user',
        isActive: true,
      });
      setCreateDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Erro',
        description: 'Erro interno ao criar usuário',
        variant: 'destructive',
      });
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: editForm.email,
          full_name: editForm.fullName,
          role: editForm.role,
          is_active: editForm.isActive,
        })
        .eq('user_id', editingUser.user_id);

      if (error) {
        console.error('Error updating user:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o usuário',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso',
      });

      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId: string, userIdAuth: string) => {
    try {
      // Delete from profiles table (this will also handle the auth user deletion via trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userIdAuth);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o usuário',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso',
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

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

  const startEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      fullName: user.full_name || '',
      role: user.role,
      isActive: user.is_active,
    });
    setEditDialogOpen(true);
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.is_active).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline">
            Atualizar
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo usuário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="usuario@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={createForm.password}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Digite a senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Papel</Label>
                  <Select 
                    value={createForm.role} 
                    onValueChange={(value: 'admin' | 'user') => 
                      setCreateForm(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={createForm.isActive}
                    onCheckedChange={(checked) => 
                      setCreateForm(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label htmlFor="isActive">Usuário ativo</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createUser}>
                    Criar Usuário
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Gerencie todos os usuários do sistema
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {user.user_id !== profile?.user_id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
                              Todas as conversas e dados relacionados também serão excluídos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteUser(user.id, user.user_id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize os dados do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editFullName">Nome Completo</Label>
              <Input
                id="editFullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="editRole">Papel</Label>
              <Select 
                value={editForm.role} 
                onValueChange={(value: 'admin' | 'user') => 
                  setEditForm(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editIsActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) => 
                  setEditForm(prev => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="editIsActive">Usuário ativo</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={updateUser}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}