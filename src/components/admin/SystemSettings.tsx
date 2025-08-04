import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, DollarSign, MessageSquare, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSetting {
  setting_key: string;
  setting_value: string;
}

export function SystemSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>);

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key: string, checked: boolean) => {
    updateSetting(key, checked.toString());
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Configurações de Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Configuração de Custo de Mensagens</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="token-amount">Quantidade de Tokens</Label>
                <Input
                  id="token-amount"
                  type="number"
                  step="0.1"
                  value={settings.token_cost_amount || '1'}
                  onChange={(e) => handleInputChange('token_cost_amount', e.target.value)}
                  placeholder="1.0"
                />
              </div>
              <div>
                <Label htmlFor="message-amount">Quantidade de Mensagens</Label>
                <Input
                  id="message-amount"
                  type="number"
                  step="1"
                  value={settings.message_cost_amount || '2'}
                  onChange={(e) => handleInputChange('message_cost_amount', e.target.value)}
                  placeholder="2"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button 
                onClick={() => {
                  updateSetting('token_cost_amount', settings.token_cost_amount);
                  updateSetting('message_cost_amount', settings.message_cost_amount);
                }}
                className="w-full"
              >
                Salvar Configuração
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Exemplo: {settings.token_cost_amount || '1'} token(s) = {settings.message_cost_amount || '2'} mensagem(ns)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configurações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsapp-phone">Telefone do WhatsApp</Label>
            <div className="flex gap-2">
              <Input
                id="whatsapp-phone"
                value={settings.whatsapp_phone || ''}
                onChange={(e) => handleInputChange('whatsapp_phone', e.target.value)}
                placeholder="5579999062129"
              />
              <Button 
                onClick={() => updateSetting('whatsapp_phone', settings.whatsapp_phone)}
              >
                Salvar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Pagamento via WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Ativar/desativar opção de recarga via WhatsApp
              </p>
            </div>
            <Switch
              checked={settings.whatsapp_payment_enabled === 'true'}
              onCheckedChange={(checked) => handleSwitchChange('whatsapp_payment_enabled', checked)}
            />
          </div>

          <div>
            <Label htmlFor="other-payment-url">URL de Pagamento Alternativo</Label>
            <div className="flex gap-2">
              <Input
                id="other-payment-url"
                value={settings.other_payment_url || ''}
                onChange={(e) => handleInputChange('other_payment_url', e.target.value)}
                placeholder="https://exemplo.com/pagamento"
              />
              <Button 
                onClick={() => updateSetting('other_payment_url', settings.other_payment_url)}
              >
                Salvar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Pagamento Alternativo</Label>
              <p className="text-sm text-muted-foreground">
                Ativar/desativar opção de pagamento alternativo
              </p>
            </div>
            <Switch
              checked={settings.other_payment_enabled === 'true'}
              onCheckedChange={(checked) => handleSwitchChange('other_payment_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configurações da API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="api-key">Chave da API OpenAI</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="text"
                value={settings.openai_api_key || ''}
                onChange={(e) => handleInputChange('openai_api_key', e.target.value)}
                placeholder="sk-..."
              />
              <Button 
                onClick={() => updateSetting('openai_api_key', settings.openai_api_key)}
              >
                Salvar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Chave da API OpenAI real. Alterações têm efeito imediato.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}