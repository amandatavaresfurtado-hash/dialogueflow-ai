import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  MessageSquare, 
  Eye, 
  Pencil, 
  Trash2,
  Calendar,
  User
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
  message_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export function ConversationsManager() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      // First get conversations with manual join
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as conversas',
          variant: 'destructive',
        });
        return;
      }

      // Get profiles data separately
      const userIds = conversationsData?.map(conv => conv.user_id).filter(Boolean) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      // Create a map for quick lookup
      const profilesMap = new Map(
        profilesData?.map(profile => [profile.user_id, profile]) || []
      );

      // Get message counts and combine data
      const conversationsWithCounts = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);
          
          const profile = profilesMap.get(conv.user_id);
          
          return { 
            ...conv, 
            message_count: count || 0,
            profiles: profile ? {
              email: profile.email,
              full_name: profile.full_name
            } : undefined
          };
        })
      );

      setConversations(conversationsWithCounts);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as mensagens',
          variant: 'destructive',
        });
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // First delete messages
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir as mensagens',
          variant: 'destructive',
        });
        return;
      }

      // Then delete conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) {
        console.error('Error deleting conversation:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a conversa',
          variant: 'destructive',
        });
        return;
      }

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      toast({
        title: 'Sucesso',
        description: 'Conversa excluída com sucesso',
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const updateConversationTitle = async () => {
    if (!editingConversation || !newTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: newTitle.trim() })
        .eq('id', editingConversation.id);

      if (error) {
        console.error('Error updating conversation:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar a conversa',
          variant: 'destructive',
        });
        return;
      }

      setConversations(prev => 
        prev.map(conv => 
          conv.id === editingConversation.id 
            ? { ...conv, title: newTitle.trim() }
            : conv
        )
      );

      setEditingConversation(null);
      setNewTitle('');
      toast({
        title: 'Sucesso',
        description: 'Título da conversa atualizado',
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const viewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const startEdit = (conversation: Conversation) => {
    setEditingConversation(conversation);
    setNewTitle(conversation.title);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Conversas</h2>
          <p className="text-muted-foreground">
            Visualize, edite e exclua conversas dos usuários
          </p>
        </div>
        <Button onClick={fetchConversations} variant="outline">
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Histórico de Conversas
          </CardTitle>
          <CardDescription>
            Total de {conversations.length} conversas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando conversas...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{conversation.title}</h3>
                      <Badge variant="secondary">
                        {conversation.message_count || 0} mensagens
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {conversation.profiles?.full_name || conversation.profiles?.email || 'Usuário desconhecido'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(conversation.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewConversation(conversation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{selectedConversation?.title}</DialogTitle>
                          <DialogDescription>
                            Conversa com {selectedConversation?.profiles?.full_name || selectedConversation?.profiles?.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div 
                              key={message.id}
                              className={`p-3 rounded-lg ${
                                message.role === 'user' 
                                  ? 'bg-primary/10 ml-8' 
                                  : 'bg-muted mr-8'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                                  {message.role === 'user' ? 'Usuário' : 'Assistente'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.created_at).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              {message.image_url && (
                                <img 
                                  src={message.image_url} 
                                  alt="Imagem da mensagem" 
                                  className="mt-2 max-w-xs rounded"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={editingConversation?.id === conversation.id} onOpenChange={(open) => {
                      if (!open) {
                        setEditingConversation(null);
                        setNewTitle('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEdit(conversation)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Conversa</DialogTitle>
                          <DialogDescription>
                            Altere o título da conversa
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Título</Label>
                            <Input
                              id="title"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="Digite o novo título"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setEditingConversation(null);
                                setNewTitle('');
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={updateConversationTitle}>
                              Salvar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

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
                            Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
                            Todas as mensagens relacionadas também serão excluídas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteConversation(conversation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {conversations.length === 0 && !loading && (
                <div className="text-center p-6">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}