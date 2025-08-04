import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, Plus, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  tokens: number;
  is_active: boolean;
}

interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'debit' | 'credit';
  description: string;
  created_at: string;
}

export function TokensManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, tokens, is_active')
        .order('email');

      if (usersError) throw usersError;

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('token_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;

      setUsers(usersData || []);
      setTransactions((transactionsData || []) as TokenTransaction[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTokens = async () => {
    if (!selectedUserId || !tokenAmount) {
      toast({
        title: "Erro",
        description: "Selecione um usuário e informe a quantidade de tokens",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(tokenAmount);
      
      // Get current user tokens
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('user_id', selectedUserId)
        .single();

      if (userError) throw userError;

      // Update user tokens
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tokens: (user.tokens || 0) + amount })
        .eq('user_id', selectedUserId);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: selectedUserId,
          amount: amount,
          transaction_type: 'credit',
          description: description || 'Tokens adicionados pelo admin'
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Sucesso",
        description: `${amount} tokens adicionados com sucesso`,
      });

      setSelectedUserId('');
      setTokenAmount('');
      setDescription('');
      loadData();
    } catch (error) {
      console.error('Error adding tokens:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar tokens",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="user-select">Usuário</Label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="">Selecione um usuário</option>
              {users.map((user) => (
                <option key={user.id} value={user.user_id}>
                  {user.email} - {user.tokens} tokens
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="token-amount">Quantidade de Tokens</Label>
            <Input
              id="token-amount"
              type="number"
              step="0.1"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              placeholder="0.0"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Motivo da adição de tokens"
            />
          </div>
          <Button onClick={addTokens} className="w-full">
            Adicionar Tokens
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Usuários e Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.full_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline">
                    {user.tokens} tokens
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((transaction) => {
              const user = users.find(u => u.user_id === transaction.user_id);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">{transaction.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={transaction.transaction_type === 'credit' ? 'default' : 'destructive'}>
                      {transaction.transaction_type === 'credit' ? '+' : '-'}{transaction.amount}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}