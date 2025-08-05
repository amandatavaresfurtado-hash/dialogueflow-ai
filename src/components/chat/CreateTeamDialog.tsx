import { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface CreateTeamDialogProps {
  onTeamCreated: (teamId: string) => void;
}

export function CreateTeamDialog({ onTeamCreated }: CreateTeamDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateTeam = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome da equipe",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (teamError) {
        throw teamError;
      }

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user?.id,
          role: 'admin',
        });

      if (memberError) {
        throw memberError;
      }

      // Add members if provided
      if (memberEmails.trim()) {
        const emails = memberEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email);

        for (const email of emails) {
          // Check if user exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', email)
            .maybeSingle();

          if (profile) {
            await supabase
              .from('team_members')
              .insert({
                team_id: team.id,
                user_id: profile.user_id,
                role: 'member',
              });
          }
        }
      }

      toast({
        title: "Equipe criada",
        description: "A equipe foi criada com sucesso",
      });

      onTeamCreated(team.id);
      setName('');
      setDescription('');
      setMemberEmails('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Erro ao criar equipe",
        description: "Ocorreu um erro ao criar a equipe",
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
          <Users className="h-4 w-4 mr-2" />
          Criar Equipe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Equipe</DialogTitle>
          <DialogDescription>
            Crie uma equipe para colaborar com outros usuários
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da equipe</Label>
            <Input
              id="name"
              placeholder="Nome da equipe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descrição da equipe"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="members">Emails dos membros (opcional)</Label>
            <Textarea
              id="members"
              placeholder="email1@exemplo.com, email2@exemplo.com"
              value={memberEmails}
              onChange={(e) => setMemberEmails(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separe os emails por vírgula. Apenas usuários cadastrados serão adicionados.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateTeam} disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Equipe'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}