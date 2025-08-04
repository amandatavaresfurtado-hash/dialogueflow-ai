import { AdminPanel } from '@/components/admin/AdminPanel';
import { CreateAdminForm } from '@/components/auth/CreateAdminForm';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isAdmin } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not logged in, show admin creation form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <CreateAdminForm />
      </div>
    );
  }

  // If logged in but no profile or not admin, show access denied
  if (!profile || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta página.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminPanel />;
};

export default Admin;