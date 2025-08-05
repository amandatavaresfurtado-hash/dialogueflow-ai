# FHUB - GPT 1.0

Sistema de chat com IA baseado em GPT, com funcionalidades administrativas completas e gestão de usuários.

## 📋 Sobre o Sistema

FHUB - GPT 1.0 é uma aplicação web moderna que oferece:
- Chat com IA (GPT-4o-mini) com histórico de conversas
- Sistema de autenticação seguro
- Painel administrativo completo para gestão de usuários e conversas
- Interface responsiva e amigável

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

### APIs Externas
- **OpenAI API** - Integração com GPT-4o-mini

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

O sistema já vem configurado com as credenciais do Supabase integradas. Você precisará apenas configurar:

#### Secrets no Supabase (Edge Functions)
Acesse o painel do Supabase e configure os seguintes secrets:
- `OPENAI_API_KEY` - Sua chave da API OpenAI

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

### Gestão de Conversas
- ✅ Visualizar todas as conversas
- ✅ Ler mensagens completas
- ✅ Editar títulos das conversas
- ✅ Excluir conversas (com todas as mensagens)
- ✅ Filtros e ordenação

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
2. Gerencie usuários na aba "Usuários"
3. Gerencie conversas na aba "Conversas"
4. Ative novos usuários conforme necessário

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

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

---

**Desenvolvido com ❤️ usando React, TypeScript, Supabase e OpenAI**