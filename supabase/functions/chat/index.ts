import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_url?: string;
}

interface AIProvider {
  name: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get AI provider settings
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'ai_provider',
        'ai_model',
        'groq_api_key',
        'groq_model',
        'lmstudio_api_url',
        'lmstudio_model',
        'anthropic_api_key',
        'anthropic_model',
        'together_api_key',
        'together_model',
        'gemini_api_key',
        'gemini_model'
      ])

    if (error) {
      throw new Error('Failed to load AI provider settings')
    }

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>)

    const provider = settingsMap.ai_provider || 'openai'
    
    let response
    switch (provider) {
      case 'openai':
        response = await callOpenAI(messages, settingsMap)
        break
      case 'groq':
        response = await callGroq(messages, settingsMap)
        break
      case 'lmstudio':
        response = await callLMStudio(messages, settingsMap)
        break
      case 'anthropic':
        response = await callAnthropic(messages, settingsMap)
        break
      case 'together':
        response = await callTogether(messages, settingsMap)
        break
      case 'gemini':
        response = await callGemini(messages, settingsMap)
        break
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }

    return new Response(JSON.stringify(response), {
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

// OpenAI API call
async function callOpenAI(messages: ChatMessage[], settings: Record<string, string>) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const openaiMessages: any[] = []
  
  for (const message of messages) {
    if (message.role === 'user' && message.image_url) {
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
      openaiMessages.push({
        role: message.role,
        content: message.content
      })
    }
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.ai_model || 'gpt-4o-mini',
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
  return data.choices[0]?.message?.content
}

// Groq API call
async function callGroq(messages: ChatMessage[], settings: Record<string, string>) {
  const apiKey = settings.groq_api_key
  if (!apiKey) {
    throw new Error('Groq API key not configured')
  }

  const groqMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.groq_model || 'llama-3.1-8b-instant',
      messages: groqMessages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content
}

// LM Studio API call
async function callLMStudio(messages: ChatMessage[], settings: Record<string, string>) {
  const baseUrl = settings.lmstudio_api_url || 'http://localhost:1234'
  
  const lmMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.lmstudio_model || 'local-model',
      messages: lmMessages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LM Studio API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content
}

// Anthropic API call
async function callAnthropic(messages: ChatMessage[], settings: Record<string, string>) {
  const apiKey = settings.anthropic_api_key
  if (!apiKey) {
    throw new Error('Anthropic API key not configured')
  }

  // Convert messages format for Anthropic
  const anthropicMessages = []
  let systemMessage = ''
  
  for (const message of messages) {
    if (message.role === 'system') {
      systemMessage = message.content
    } else {
      anthropicMessages.push({
        role: message.role,
        content: message.content
      })
    }
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: settings.anthropic_model || 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemMessage,
      messages: anthropicMessages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()
  return data.content[0]?.text
}

// Together API call
async function callTogether(messages: ChatMessage[], settings: Record<string, string>) {
  const apiKey = settings.together_api_key
  if (!apiKey) {
    throw new Error('Together API key not configured')
  }

  const togetherMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.together_model || 'meta-llama/Llama-2-7b-chat-hf',
      messages: togetherMessages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Together API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content
}

// Gemini API call
async function callGemini(messages: ChatMessage[], settings: Record<string, string>) {
  const apiKey = settings.gemini_api_key
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  // Convert messages for Gemini format
  const geminiContents = []
  
  for (const message of messages) {
    if (message.role !== 'system') {
      geminiContents.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      })
    }
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.gemini_model || 'gemini-pro'}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: geminiContents,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  return data.candidates[0]?.content?.parts[0]?.text
}