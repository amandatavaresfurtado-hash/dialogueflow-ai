
import { AdminPanel } from '@/components/admin/AdminPanel';
import { CreateAdminForm } from '@/components/auth/CreateAdminForm';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isAdmin, isActive } = useProfile();

  console.log('Admin page state:', {
    user: !!user,
    profile: !!profile,
    isAdmin,
    isActive,
    authLoading,
    profileLoading,
    profileRole: profile?.role,
    profileActive: profile?.is_active
  });

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not logged in, show admin creation form
  if (!user) {
    console.log('Admin: No user logged in, showing create admin form');
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <CreateAdminForm />
      </div>
    );
  }

  // If logged in but no profile or not admin, show access denied
  if (!profile || !isAdmin || !isActive) {
    console.log('Admin: Access denied - Profile:', !!profile, 'isAdmin:', isAdmin, 'isActive:', isActive);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground mb-4">
                Você não tem permissão para acessar esta página.
              </p>
              
              {/* Debug information */}
              <div className="text-xs text-muted-foreground space-y-1 mt-4 p-2 bg-gray-100 rounded">
                <p><strong>Debug Info:</strong></p>
                <p>User: {user.email}</p>
                <p>Profile exists: {profile ? 'Yes' : 'No'}</p>
                {profile && (
                  <>
                    <p>Role: {profile.role}</p>
                    <p>Active: {profile.is_active ? 'Yes' : 'No'}</p>
                    <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Admin: Access granted, showing admin panel');
  return <AdminPanel />;
};

export default Admin;
