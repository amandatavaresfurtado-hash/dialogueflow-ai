import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SystemSetting {
  setting_key: string;
  setting_value: string;
}

export function TokenDisplay() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<number>(0);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserTokens();
      loadSettings();
    }
  }, [user]);

  const loadUserTokens = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setTokens(data?.tokens || 0);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppUrl = () => {
    const phone = settings.whatsapp_phone || '5579999062129';
    return `https://api.whatsapp.com/send/?phone=${phone}&text&type=phone_number&app_absent=0`;
  };

  const getMessageCount = () => {
    const cost = parseFloat(settings.message_cost_tokens || '0.5');
    return Math.floor(tokens / cost);
  };

  if (loading) return null;

  const whatsappEnabled = settings.whatsapp_payment_enabled === 'true';
  const otherPaymentEnabled = settings.other_payment_enabled === 'true';
  const otherPaymentUrl = settings.other_payment_url || '';

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span className="font-medium">{tokens.toFixed(1)} tokens</span>
            <span className="text-sm text-muted-foreground">
              (~{getMessageCount()} mensagens)
            </span>
          </div>
          
          {(whatsappEnabled || otherPaymentEnabled) && tokens < 1 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Recarregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recarregar Tokens</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Seus tokens estão acabando. Escolha uma opção de recarga:
                  </p>
                  
                  {whatsappEnabled && (
                    <Button 
                      onClick={() => window.open(getWhatsAppUrl(), '_blank')}
                      className="w-full"
                      variant="outline"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Recarregar via WhatsApp
                    </Button>
                  )}
                  
                  {otherPaymentEnabled && otherPaymentUrl && (
                    <Button 
                      onClick={() => window.open(otherPaymentUrl, '_blank')}
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagamento Online
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}