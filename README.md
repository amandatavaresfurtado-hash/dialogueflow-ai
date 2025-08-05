# FHUB - GPT 1.0

Uma plataforma de chat AI completa com sistema de tokens, autenticação, administração e funcionalidades colaborativas.

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- Sistema completo de login/registro com Supabase Auth
- Perfis de usuário com roles (admin/user)
- Sistema de ativação de contas por administradores
- Controle de acesso baseado em roles

### 💬 Chat Inteligente
- Interface de chat moderna e responsiva
- Integração com OpenAI GPT-4o-mini
- Suporte a múltiplas conversas
- Histórico persistente de conversas
- Edição e exclusão de conversas

### 📎 Anexos e Mídia
- **Imagens**: Upload e visualização de imagens no chat
- **Arquivos**: Suporte a anexos PDF e ZIP (até 10MB)
- Storage seguro com Supabase Storage
- Preview de arquivos e download direto

### 🪙 Sistema de Tokens
- Sistema de créditos por mensagem
- Controle de custos personalizável por administradores
- Histórico de transações de tokens
- Bloqueio automático quando tokens insuficientes

### 👥 Funcionalidades Colaborativas

#### Compartilhamento de Chat
- Compartilhe conversas com outros usuários da plataforma
- Busca por email do destinatário
- Verificação automática de usuários válidos
- Controle de acesso por RLS

#### Equipes/Grupos
- Criação de equipes colaborativas
- Convite de membros por email
- Chat em grupo onde cada membro usa seus próprios tokens
- Roles de admin e membro na equipe
- Continuidade de conversa mesmo se um membro ficar sem tokens

### ⚙️ Painel Administrativo

#### Gerenciamento de Usuários
- Visualização de todos os usuários
- Ativação/desativação de contas
- Gerenciamento de tokens por usuário
- Alteração de roles (admin/user)

#### Configurações do Sistema
- Definição do custo por mensagem
- Configuração de chaves API
- Controle de configurações globais

#### Monitoramento
- Visualização de transações de tokens
- Histórico de atividades
- Métricas de uso da plataforma

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **React Router** - Roteamento
- **Lucide Icons** - Ícones

### Backend
- **Supabase** - Backend completo
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança a nível de linha
- **Supabase Storage** - Armazenamento de arquivos
- **Supabase Edge Functions** - Funções serverless

### Integrações
- **OpenAI API** - Inteligência artificial
- **React Markdown** - Renderização de markdown
- **React Syntax Highlighter** - Syntax highlighting para código

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Conta no Supabase
- Chave da API OpenAI

### Instalação
1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente no Supabase
4. Execute as migrações do banco de dados
5. Configure a chave da OpenAI no painel admin
6. Execute o projeto: `npm run dev`

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `profiles` - Perfis de usuários
- `conversations` - Conversas do chat
- `messages` - Mensagens individuais
- `teams` - Equipes/grupos
- `team_members` - Membros das equipes
- `shared_conversations` - Conversas compartilhadas
- `token_transactions` - Histórico de tokens
- `system_settings` - Configurações globais

### Storage Buckets
- `chat-images` - Imagens do chat
- `chat-attachments` - Anexos de arquivos

## 🔒 Segurança

- Row Level Security (RLS) em todas as tabelas
- Autenticação obrigatória para todas as operações
- Validação de tipos de arquivo e tamanho
- Políticas de acesso granulares
- Proteção contra acesso não autorizado

## 📈 Funcionalidades Futuras

- [ ] Notificações em tempo real
- [ ] Integração com mais modelos de AI
- [ ] Sistema de assinaturas
- [ ] API pública
- [ ] Aplicativo mobile
- [ ] Temas personalizáveis
- [ ] Integração com Discord/Slack

---

**Desenvolvido com ❤️ usando React, Supabase e OpenAI**