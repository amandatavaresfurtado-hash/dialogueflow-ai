import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserX } from 'lucide-react';
import { ConversationsManager } from './ConversationsManager';
import { UsersManager } from './UsersManager';

export function AdminPanel() {
  const { isAdmin } = useProfile();

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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">FHUB - Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, conversas e permissões do sistema
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UsersManager />
        </TabsContent>
        
        <TabsContent value="conversations">
          <ConversationsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}