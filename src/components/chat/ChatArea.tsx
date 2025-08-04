import { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageList } from './MessageList';
import { TokenDisplay } from './TokenDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
  created_at: string;
}

interface ChatAreaProps {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatArea({ conversationId, onConversationCreated }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<number>(0);
  const [messageCost, setMessageCost] = useState<number>(0.5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
    loadUserTokens();
    loadSystemSettings();
  }, [conversationId, user]);

  const loadUserTokens = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserTokens(data?.tokens || 0);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'message_cost_tokens')
        .single();

      if (error) throw error;
      setMessageCost(parseFloat(data?.setting_value || '0.5'));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages((data || []).map(msg => ({
      ...msg,
      role: msg.role as 'user' | 'assistant'
    })));
  };

  const createConversationIfNeeded = async () => {
    if (conversationId) return conversationId;

    const { data, error } = await supabase
      .from('conversations')
      .insert([{ 
        title: 'Nova conversa',
        user_id: (await supabase.auth.getUser()).data.user?.id 
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar conversa",
        variant: "destructive",
      });
      throw error;
    }

    onConversationCreated(data.id);
    return data.id;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    // Check if user has enough tokens
    if (userTokens < messageCost) {
      toast({
        title: "Tokens insuficientes",
        description: "Você não tem tokens suficientes para enviar mensagens. Faça uma recarga.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const currentConversationId = await createConversationIfNeeded();
      
      let imageUrl: string | undefined;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      // Add user message
      const userMessage = {
        conversation_id: currentConversationId,
        role: 'user' as const,
        content: inputValue.trim(),
        image_url: imageUrl,
      };

      const { data: userMsgData, error: userMsgError } = await supabase
        .from('messages')
        .insert([userMessage])
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      setMessages(prev => [...prev, {
        ...userMsgData,
        role: userMsgData.role as 'user' | 'assistant'
      }]);
      setInputValue('');
      setSelectedImage(null);
      setImagePreview(null);

      // Call Supabase Edge Function
      const response = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMsgData].map(msg => ({
            role: msg.role,
            content: msg.content,
            ...(msg.image_url && { image_url: msg.image_url })
          })),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Falha na resposta da API');
      }

      const assistantContent = response.data;

      // Add assistant response
      const assistantMessage = {
        conversation_id: currentConversationId,
        role: 'assistant' as const,
        content: assistantContent,
      };

      const { data: assistantMsgData, error: assistantMsgError } = await supabase
        .from('messages')
        .insert([assistantMessage])
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;

      setMessages(prev => [...prev, {
        ...assistantMsgData,
        role: assistantMsgData.role as 'user' | 'assistant'
      }]);

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        const title = inputValue.trim().slice(0, 50) || 'Nova conversa';
        await supabase
          .from('conversations')
          .update({ title })
          .eq('id', currentConversationId);
      }

      // Debit tokens from user
      const newTokenBalance = userTokens - messageCost;
      await supabase
        .from('profiles')
        .update({ tokens: newTokenBalance })
        .eq('user_id', user!.id);

      // Record token transaction
      await supabase
        .from('token_transactions')
        .insert({
          user_id: user!.id,
          amount: messageCost,
          transaction_type: 'debit',
          description: 'Mensagem enviada no chat'
        });

      // Update local token state
      setUserTokens(newTokenBalance);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <TokenDisplay />
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <div className="border-t bg-background p-4">
        <Card className="p-4">
          {imagePreview && (
            <div className="mb-4 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-xs max-h-32 rounded object-cover"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                ×
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="flex gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>

            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />

            <Button
              onClick={sendMessage}
              disabled={isLoading || (!inputValue.trim() && !selectedImage) || userTokens < messageCost}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}