import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatArea } from "@/components/chat/ChatArea";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function ChatLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, isActive, isAdmin } = useProfile();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  // Show pending activation message if user is not active
  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Conta Pendente de Ativação</h2>
                <p className="text-muted-foreground">
                  Sua conta foi criada com sucesso, mas ainda precisa ser ativada por um administrador.
                  Entre em contato para solicitar a ativação.
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <Button asChild variant="outline">
                    <Link to="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Painel Admin
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={signOut}>
                  Sair
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-chat-background">
        <ChatSidebar 
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />
        
        <div className="flex-1 flex flex-col">
          <ChatHeader />
          <ChatArea 
            conversationId={selectedConversationId}
            onConversationCreated={setSelectedConversationId}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}