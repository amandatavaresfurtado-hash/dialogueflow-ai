# FHUB - GPT 1.0

Um sistema completo de chat com IA que suporta múltiplos provedores de IA e funcionalidades avançadas.

## 🚀 Funcionalidades

### Chat e Mensagens
- ✅ Interface de chat em tempo real
- ✅ Suporte a mensagens de texto
- ✅ Upload e processamento de imagens
- ✅ Upload de anexos (documentos, arquivos)
- ✅ Histórico de conversas
- ✅ Sidebar com gerenciamento de conversas

### Múltiplos Provedores de IA
- ✅ **OpenAI** - GPT-4o-mini, GPT-4o, etc.
- ✅ **Groq** - Llama 3.1, modelos de alta performance
- ✅ **LM Studio** - Modelos locais auto-hospedados
- ✅ **Anthropic Claude** - Claude 3 Haiku, Sonnet, Opus
- ✅ **Together.ai** - Llama 2, Code Llama, etc.
- ✅ **Google Gemini** - Gemini Pro, modelos Google

### Sistema de Autenticação
- ✅ Registro e login de usuários
- ✅ Autenticação com Supabase Auth
- ✅ Perfis de usuário personalizados
- ✅ Sistema de papéis (Admin/User)
- ✅ Ativação de conta por administrador

### Sistema de Tokens
- ✅ Sistema de créditos/tokens por usuário
- ✅ Cobrança por mensagem configurável
- ✅ Histórico de transações de tokens
- ✅ Recarga via WhatsApp ou link personalizado

### Painel Administrativo
- ✅ Gerenciamento completo de usuários
- ✅ Configuração de todas as APIs de IA
- ✅ Configurações de sistema (custos, pagamentos)
- ✅ Monitoramento de conversas e tokens
- ✅ Ativação/desativação de usuários

### Interface e UX
- ✅ Design responsivo e moderno
- ✅ Modo escuro/claro
- ✅ Componentes acessíveis (shadcn/ui)
- ✅ Loading states e feedback visual
- ✅ Notificações toast
- ✅ Footer com versão atual da IA

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca JavaScript para interface
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Componentes UI reutilizáveis
- **React Router DOM** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Tanstack Query** - Gerenciamento de estado servidor

### Backend/Banco de Dados
- **Supabase** - Backend as a Service
  - PostgreSQL como banco de dados
  - Autenticação integrada
  - Row Level Security (RLS)
  - Edge Functions
  - Storage para arquivos

### APIs de IA Integradas
- **OpenAI API** - GPT models
- **Groq API** - High-performance LLMs
- **LM Studio** - Local model hosting
- **Anthropic API** - Claude models
- **Together.ai API** - Open source models
- **Google Gemini API** - Google's models

## 🏗️ Arquitetura do Banco de Dados

### Tabelas Principais

#### `profiles`
- Armazena informações dos usuários
- Campos: id, user_id, email, full_name, role, is_active, created_at, updated_at
- RLS habilitado para segurança

#### `conversations`
- Histórico de conversas dos usuários
- Campos: id, user_id, title, created_at, updated_at
- Relacionado ao usuário via user_id

#### `messages`
- Mensagens individuais das conversas
- Campos: id, conversation_id, role, content, image_url, created_at
- Relacionado à conversa via conversation_id

### Funções do Banco
- `handle_new_user()` - Cria perfil automaticamente ao registrar usuário
- `has_role()` - Verifica permissões de usuário
- `is_user_active()` - Verifica se usuário está ativo
- `update_updated_at_column()` - Atualiza timestamp automaticamente

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase
- Chave da API OpenAI

### 1. Clonar o Repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd fhub-gpt
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configuração do Ambiente

O sistema já vem configurado com as credenciais do Supabase integradas.

#### Configuração das APIs no Painel Admin
Após o primeiro deploy, acesse `/admin` e configure:

**APIs de IA Suportadas:**
- **OpenAI** - Configure sua chave da API OpenAI
- **Groq** - Configure sua chave da API Groq  
- **LM Studio** - Configure a URL do seu servidor local
- **Anthropic** - Configure sua chave da API Claude
- **Together.ai** - Configure sua chave da API Together
- **Google Gemini** - Configure sua chave da API Gemini

**Sistema de Tokens:**
- Defina custo em tokens por mensagem
- Configure opções de recarga (WhatsApp, link personalizado)

### 4. Executar em Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🚀 Deploy/Hospedagem

### Opções Recomendadas de Hospedagem

#### 1. **Vercel** (Recomendado)
- Deploy automático via Git
- Configuração zero
- CDN global
- SSL automático

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### 2. **Netlify**
- Build automático
- CDN integrado
- Formulários e funções serverless

#### 3. **Render**
- Deploy gratuito
- Builds automáticos
- SSL incluído

#### 4. **Railway**
- Deploy simples
- Escalabilidade automática

### Configuração de Build
```bash
# Build de produção
npm run build

# Preview local do build
npm run preview
```

## 👨‍💼 Funcionalidades Administrativas

### Gestão de Usuários
- ✅ Criar usuários manualmente
- ✅ Editar informações (nome, email, papel, status)
- ✅ Ativar/desativar usuários
- ✅ Promover/rebaixar administradores
- ✅ Excluir usuários
- ✅ Visualizar estatísticas
- ✅ Gerenciar tokens de usuários

### Gestão de Conversas
- ✅ Visualizar todas as conversas
- ✅ Ler mensagens completas
- ✅ Editar títulos das conversas
- ✅ Excluir conversas (com todas as mensagens)
- ✅ Filtros e ordenação

### Configurações do Sistema
- ✅ **Múltiplos Provedores de IA** - Alternar entre OpenAI, Groq, LM Studio, Claude, Together.ai, Gemini
- ✅ **Configuração de Modelos** - Definir modelos específicos para cada provedor
- ✅ **Sistema de Tokens** - Configurar custos e opções de recarga
- ✅ **Chaves de API** - Gerenciar todas as chaves de forma segura

## 🔐 Sistema de Autenticação

### Tipos de Usuário
- **user** - Usuário comum (pode usar o chat)
- **admin** - Administrador (acesso total ao sistema)

### Segurança
- Row Level Security (RLS) habilitado
- Políticas de acesso granulares
- Senhas criptografadas via Supabase Auth
- Sessões seguras com tokens JWT

## 📱 Como Usar

### Para Usuários
1. Registre-se ou faça login
2. Aguarde ativação por um administrador
3. Use o chat para conversar com a IA
4. Suas conversas ficam salvas no histórico

### Para Administradores
1. Acesse `/admin` após fazer login
2. **Configurações do Sistema** - Configure provedores de IA, modelos e tokens
3. **Usuários** - Gerencie usuários e seus tokens
4. **Conversas** - Monitore conversas do sistema
5. **Tokens** - Gerencie transações e recargas
6. Ative novos usuários conforme necessário

## 🔧 Manutenção

### Logs e Monitoramento
- Logs do Edge Function disponíveis no Supabase
- Console do navegador para debug frontend
- Métricas de uso no painel Supabase

### Backup
- Dados armazenados no PostgreSQL (Supabase)
- Backup automático do Supabase
- Exporte dados via SQL se necessário

## 📞 Suporte

### Estrutura de Arquivos
```
src/
├── components/
│   ├── admin/          # Painel administrativo
│   ├── auth/           # Autenticação
│   ├── chat/           # Interface do chat
│   ├── layout/         # Layouts
│   └── ui/             # Componentes UI
├── hooks/              # Custom hooks
├── integrations/       # Integrações (Supabase)
├── lib/                # Utilitários
└── pages/              # Páginas
```

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Preview build
npm run preview
```

## 📁 Estrutura Atualizada do Projeto

```
src/
├── components/
│   ├── admin/          # Painel administrativo completo
│   │   ├── AdminPanel.tsx
│   │   ├── UsersManager.tsx
│   │   ├── ConversationsManager.tsx
│   │   ├── TokensManager.tsx
│   │   └── SystemSettings.tsx
│   ├── auth/           # Sistema de autenticação
│   ├── chat/           # Interface de chat
│   ├── layout/         # Layout e footer
│   └── ui/             # Componentes base (shadcn)
├── hooks/              # Custom hooks
├── lib/                # Utilitários
├── pages/              # Páginas da aplicação
└── integrations/       # Integrações (Supabase)

supabase/
├── functions/          # Edge Functions
│   └── chat/           # Função que suporta múltiplas APIs
└── migrations/         # Migrações do banco de dados
```

## 🔐 Segurança

- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Autenticação JWT com Supabase
- ✅ Validação de dados no frontend e backend
- ✅ Chaves de API armazenadas de forma segura
- ✅ Políticas de acesso por papel de usuário

## 📊 Sistema de Tokens

O sistema permite configurar:
- Quantidade de tokens por mensagem
- Opções de recarga (WhatsApp, link personalizado)
- Histórico completo de transações
- Bloqueio automático quando tokens insuficientes

## 🎨 Interface

- Design moderno com Tailwind CSS
- Componentes acessíveis do shadcn/ui
- Suporte a modo escuro/claro
- Responsivo para desktop e mobile
- Feedback visual em tempo real
- **Footer dinâmico** - Mostra o provedor e modelo de IA atual

## 📱 Funcionalidades em Tempo Real

- Atualização de mensagens via Supabase Realtime
- Sincronização de tokens em tempo real
- Notificações de sistema instantâneas
- **Atualização automática da versão da IA no footer**

## 🚀 Deploy

O projeto pode ser implantado em qualquer plataforma que suporte:
- Build de aplicação React/Vite
- Conexão com Supabase
- Variáveis de ambiente para as APIs

Plataformas recomendadas:
- Vercel
- Netlify
- Supabase Hosting

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

---

**Status do Projeto: ✅ FINALIZADO**

Todas as funcionalidades solicitadas foram implementadas e testadas:
- ✅ Múltiplos provedores de IA (OpenAI, Groq, LM Studio, Claude, Together.ai, Gemini)
- ✅ Sistema de tokens completo
- ✅ Painel administrativo abrangente
- ✅ Interface responsiva e moderna
- ✅ Segurança robusta com RLS
- ✅ Footer com versão atual da IA
- ✅ Documentação completa

**Desenvolvido com ❤️ usando React, TypeScript, Supabase e múltiplas APIs de IA**