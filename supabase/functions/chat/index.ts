import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()

    // Get OpenAI API key from secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Prepare messages for OpenAI
    const openaiMessages: any[] = []
    
    for (const message of messages) {
      if (message.role === 'user' && message.image_url) {
        // Handle image + text message
        openaiMessages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: message.content || 'O que você vê nesta imagem?'
            },
            {
              type: 'image_url',
              image_url: {
                url: message.image_url,
                detail: 'high'
              }
            }
          ]
        })
      } else {
        // Handle text-only message
        openaiMessages.push({
          role: message.role,
          content: message.content
        })
      }
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    return new Response(JSON.stringify(assistantMessage), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})