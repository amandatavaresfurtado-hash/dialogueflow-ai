import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function Footer() {
  const [aiProvider, setAiProvider] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('');

  useEffect(() => {
    loadAISettings();
    
    // Subscribe to realtime changes
    const subscription = supabase
      .channel('system_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'setting_key=in.(ai_provider,ai_model,groq_model,lmstudio_model,anthropic_model,together_model,gemini_model)'
        },
        () => {
          loadAISettings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadAISettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'ai_provider',
          'ai_model',
          'groq_model',
          'lmstudio_model',
          'anthropic_model',
          'together_model',
          'gemini_model'
        ]);

      if (error) throw error;

      const settings = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>);

      const provider = settings.ai_provider || 'openai';
      setAiProvider(provider);

      // Get the appropriate model based on provider
      let model = '';
      switch (provider) {
        case 'openai':
          model = settings.ai_model || 'gpt-4o-mini';
          break;
        case 'groq':
          model = settings.groq_model || 'llama-3.1-8b-instant';
          break;
        case 'lmstudio':
          model = settings.lmstudio_model || 'local-model';
          break;
        case 'anthropic':
          model = settings.anthropic_model || 'claude-3-haiku-20240307';
          break;
        case 'together':
          model = settings.together_model || 'meta-llama/Llama-2-7b-chat-hf';
          break;
        case 'gemini':
          model = settings.gemini_model || 'gemini-pro';
          break;
        default:
          model = 'Unknown';
      }

      setAiModel(model);
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const formatProviderName = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI';
      case 'groq':
        return 'Groq';
      case 'lmstudio':
        return 'LM Studio';
      case 'anthropic':
        return 'Anthropic';
      case 'together':
        return 'Together.ai';
      case 'gemini':
        return 'Google Gemini';
      default:
        return provider;
    }
  };

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-center h-12 px-4">
        <p className="text-xs text-muted-foreground">
          {formatProviderName(aiProvider)} • {aiModel} • Powered by - LisboaCodes
        </p>
      </div>
    </footer>
  );
}