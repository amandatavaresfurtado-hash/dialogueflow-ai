import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, DollarSign, MessageSquare, Key, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSetting {
  setting_key: string;
  setting_value: string;
}

export function SystemSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(true);
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
        }, {
          onConflict: 'setting_key'
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
            Configurações da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Provider Selection */}
          <div>
            <Label htmlFor="ai-provider">Provedor de IA</Label>
            <div className="flex gap-2">
              <select
                id="ai-provider"
                value={settings.ai_provider || 'openai'}
                onChange={(e) => handleInputChange('ai_provider', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="openai">OpenAI</option>
                <option value="groq">Groq</option>
                <option value="lmstudio">LM Studio</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="together">Together.ai</option>
                <option value="gemini">Google Gemini</option>
              </select>
              <Button 
                onClick={() => updateSetting('ai_provider', settings.ai_provider)}
              >
                Salvar
              </Button>
            </div>
          </div>

          {/* OpenAI Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">OpenAI</h4>
              <Switch
                checked={settings.ai_provider === 'openai'}
                onCheckedChange={(checked) => checked && updateSetting('ai_provider', 'openai')}
              />
            </div>
            <div>
              <Label htmlFor="openai-api-key">Chave da API OpenAI</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="openai-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={settings.openai_api_key || ''}
                    onChange={(e) => handleInputChange('openai_api_key', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => updateSetting('openai_api_key', settings.openai_api_key)}
                >
                  Salvar
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="ai-model">Modelo OpenAI</Label>
              <div className="flex gap-2">
                <Input
                  id="ai-model"
                  value={settings.ai_model || 'gpt-4o-mini'}
                  onChange={(e) => handleInputChange('ai_model', e.target.value)}
                  placeholder="gpt-4o-mini"
                />
                <Button 
                  onClick={() => updateSetting('ai_model', settings.ai_model)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* Groq Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Groq</h4>
              <Switch
                checked={settings.ai_provider === 'groq'}
                onCheckedChange={(checked) => checked && updateSetting('ai_provider', 'groq')}
              />
            </div>
            <div>
              <Label htmlFor="groq-api-key">Chave da API Groq</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="groq-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={settings.groq_api_key || ''}
                    onChange={(e) => handleInputChange('groq_api_key', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => updateSetting('groq_api_key', settings.groq_api_key)}
                >
                  Salvar
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="groq-model">Modelo Groq</Label>
              <div className="flex gap-2">
                <Input
                  id="groq-model"
                  value={settings.groq_model || 'llama-3.1-8b-instant'}
                  onChange={(e) => handleInputChange('groq_model', e.target.value)}
                  placeholder="llama-3.1-8b-instant"
                />
                <Button 
                  onClick={() => updateSetting('groq_model', settings.groq_model)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* LM Studio Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">LM Studio</h4>
              <Switch
                checked={settings.ai_provider === 'lmstudio'}
                onCheckedChange={(checked) => checked && updateSetting('ai_provider', 'lmstudio')}
              />
            </div>
            <div>
              <Label htmlFor="lmstudio-api-url">URL da API LM Studio</Label>
              <div className="flex gap-2">
                <Input
                  id="lmstudio-api-url"
                  value={settings.lmstudio_api_url || 'http://localhost:1234'}
                  onChange={(e) => handleInputChange('lmstudio_api_url', e.target.value)}
                  placeholder="http://localhost:1234"
                />
                <Button 
                  onClick={() => updateSetting('lmstudio_api_url', settings.lmstudio_api_url)}
                >
                  Salvar
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="lmstudio-model">Modelo LM Studio</Label>
              <div className="flex gap-2">
                <Input
                  id="lmstudio-model"
                  value={settings.lmstudio_model || 'local-model'}
                  onChange={(e) => handleInputChange('lmstudio_model', e.target.value)}
                  placeholder="local-model"
                />
                <Button 
                  onClick={() => updateSetting('lmstudio_model', settings.lmstudio_model)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* Anthropic Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Anthropic (Claude)</h4>
              <Switch
                checked={settings.ai_provider === 'anthropic'}
                onCheckedChange={(checked) => checked && updateSetting('ai_provider', 'anthropic')}
              />
            </div>
            <div>
              <Label htmlFor="anthropic-api-key">Chave da API Anthropic</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="anthropic-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={settings.anthropic_api_key || ''}
                    onChange={(e) => handleInputChange('anthropic_api_key', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => updateSetting('anthropic_api_key', settings.anthropic_api_key)}
                >
                  Salvar
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="anthropic-model">Modelo Anthropic</Label>
              <div className="flex gap-2">
                <Input
                  id="anthropic-model"
                  value={settings.anthropic_model || 'claude-3-haiku-20240307'}
                  onChange={(e) => handleInputChange('anthropic_model', e.target.value)}
                  placeholder="claude-3-haiku-20240307"
                />
                <Button 
                  onClick={() => updateSetting('anthropic_model', settings.anthropic_model)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* Together.ai Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Together.ai</h4>
              <Switch
                checked={settings.ai_provider === 'together'}
                onCheckedChange={(checked) => checked && updateSetting('ai_provider', 'together')}
              />
            </div>
            <div>
              <Label htmlFor="together-api-key">Chave da API Together</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="together-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={settings.together_api_key || ''}
                    onChange={(e) => handleInputChange('together_api_key', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => updateSetting('together_api_key', settings.together_api_key)}
                >
                  Salvar
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="together-model">Modelo Together</Label>
              <div className="flex gap-2">
                <Input
                  id="together-model"
                  value={settings.together_model || 'meta-llama/Llama-2-7b-chat-hf'}
                  onChange={(e) => handleInputChange('together_model', e.target.value)}
                  placeholder="meta-llama/Llama-2-7b-chat-hf"
                />
                <Button 
                  onClick={() => updateSetting('together_model', settings.together_model)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* Gemini Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Google Gemini</h4>
              <Switch
                checked={settings.ai_provider === 'gemini'}
                onCheckedChange={(checked) => checked && updateSetting('ai_provider', 'gemini')}
              />
            </div>
            <div>
              <Label htmlFor="gemini-api-key">Chave da API Gemini</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="gemini-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={settings.gemini_api_key || ''}
                    onChange={(e) => handleInputChange('gemini_api_key', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => updateSetting('gemini_api_key', settings.gemini_api_key)}
                >
                  Salvar
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="gemini-model">Modelo Gemini</Label>
              <div className="flex gap-2">
                <Input
                  id="gemini-model"
                  value={settings.gemini_model || 'gemini-pro'}
                  onChange={(e) => handleInputChange('gemini_model', e.target.value)}
                  placeholder="gemini-pro"
                />
                <Button 
                  onClick={() => updateSetting('gemini_model', settings.gemini_model)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* Toggle API Key Visibility */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ocultar Chaves
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar Chaves
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}