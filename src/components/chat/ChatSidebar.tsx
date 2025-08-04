import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Edit3, Trash2, Moon, Sun, LogOut } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
}

export function ChatSidebar({ selectedConversationId, onSelectConversation }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { state } = useSidebar();

  useEffect(() => {
    loadConversations();
    
    // Check for dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);
  };

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ title: 'Nova conversa' }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar nova conversa",
        variant: "destructive",
      });
      return;
    }

    setConversations(prev => [data, ...prev]);
    onSelectConversation(data.id);
  };

  const updateConversationTitle = async (id: string, title: string) => {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível renomear a conversa",
        variant: "destructive",
      });
      return;
    }

    setConversations(prev => 
      prev.map(conv => conv.id === id ? { ...conv, title } : conv)
    );
    setEditingId(null);
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa",
        variant: "destructive",
      });
      return;
    }

    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (selectedConversationId === id) {
      onSelectConversation(null);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  if (state === "collapsed") {
    return (
      <div className="fixed top-4 left-4 z-50">
        <SidebarTrigger />
      </div>
    );
  }

  return (
    <Sidebar className="w-64 border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">FHUB - GPT 1.0</h2>
          <SidebarTrigger />
        </div>
        
        <Button 
          onClick={createNewConversation}
          className="w-full justify-start gap-2 mt-4"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Nova conversa
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          {conversations.map((conversation) => (
            <SidebarMenuItem key={conversation.id}>
              <div className="group relative">
                {editingId === conversation.id ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => updateConversationTitle(conversation.id, editTitle)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateConversationTitle(conversation.id, editTitle);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    className="text-sm"
                    autoFocus
                  />
                ) : (
                  <SidebarMenuButton
                    onClick={() => onSelectConversation(conversation.id)}
                    className={`w-full justify-start text-left ${
                      selectedConversationId === conversation.id ? 'bg-sidebar-accent' : ''
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="truncate flex-1">{conversation.title}</span>
                  </SidebarMenuButton>
                )}
                
                {editingId !== conversation.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(conversation.id);
                      setEditTitle(conversation.title);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  </div>
                )}
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <div className="mt-auto p-4 space-y-2">
        <Button
          onClick={toggleDarkMode}
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {darkMode ? 'Modo claro' : 'Modo escuro'}
        </Button>
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </Sidebar>
  );
}