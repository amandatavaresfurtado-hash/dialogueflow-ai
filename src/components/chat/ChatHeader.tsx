import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ChatHeader() {
  const { signOut } = useAuth();
  const { isAdmin, profile } = useProfile();

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">ChatGPT Clone</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {profile?.full_name || profile?.email}
          </span>
          
          {isAdmin && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}