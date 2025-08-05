import { useState } from 'react';
import { Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ShareChatDialogProps {
  conversationId: string;
}

export function ShareChatDialog({ conversationId }: ShareChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleShare = async () => {
    if (!email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira o email do usuário",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if user exists with this email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email.trim())
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profiles) {
        toast({
          title: "Usuário não encontrado",
          description: "Não existe um usuário cadastrado com este email",
          variant: "destructive",
        });
        return;
      }

      // Check if conversation is already shared with this user
      const { data: existingShare } = await supabase
        .from('shared_conversations')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('shared_with', profiles.user_id)
        .maybeSingle();

      if (existingShare) {
        toast({
          title: "Conversa já compartilhada",
          description: "Esta conversa já foi compartilhada com este usuário",
          variant: "destructive",
        });
        return;
      }

      // Share the conversation
      const { error: shareError } = await supabase
        .from('shared_conversations')
        .insert({
          conversation_id: conversationId,
          shared_by: user?.id,
          shared_with: profiles.user_id,
        });

      if (shareError) {
        throw shareError;
      }

      toast({
        title: "Conversa compartilhada",
        description: "A conversa foi compartilhada com sucesso",
      });

      setEmail('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sharing conversation:', error);
      toast({
        title: "Erro ao compartilhar",
        description: "Ocorreu um erro ao compartilhar a conversa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Conversa</DialogTitle>
          <DialogDescription>
            Compartilhe esta conversa com outro usuário da plataforma
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do usuário</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleShare} disabled={isLoading}>
              {isLoading ? 'Compartilhando...' : 'Compartilhar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}