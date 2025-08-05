-- Create storage bucket for file attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true);

-- Add attachment support to messages table
ALTER TABLE public.messages 
ADD COLUMN attachment_url text,
ADD COLUMN attachment_type text,
ADD COLUMN attachment_name text;

-- Create teams table
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create team members table
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member', -- 'admin', 'member'
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS on team members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create shared conversations table
CREATE TABLE public.shared_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL,
  shared_with uuid NOT NULL,
  shared_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, shared_with)
);

-- Enable RLS on shared conversations
ALTER TABLE public.shared_conversations ENABLE ROW LEVEL SECURITY;

-- Add team_id to conversations table for team chats
ALTER TABLE public.conversations 
ADD COLUMN team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE;

-- Update conversations policies to include team access
DROP POLICY "Active users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations or team conversations" 
ON public.conversations 
FOR SELECT 
USING (
  (auth.uid() = user_id AND is_user_active(auth.uid())) OR
  (team_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = conversations.team_id 
    AND user_id = auth.uid() 
    AND is_user_active(auth.uid())
  )) OR
  (EXISTS (
    SELECT 1 FROM public.shared_conversations 
    WHERE conversation_id = conversations.id 
    AND shared_with = auth.uid() 
    AND is_user_active(auth.uid())
  ))
);

-- Update messages policies to include team and shared access
DROP POLICY "Active users can view messages from their conversations" ON public.messages;
CREATE POLICY "Users can view messages from their conversations, team conversations, or shared conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (
      (conversations.user_id = auth.uid() AND is_user_active(auth.uid())) OR
      (conversations.team_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_id = conversations.team_id 
        AND user_id = auth.uid() 
        AND is_user_active(auth.uid())
      )) OR
      (EXISTS (
        SELECT 1 FROM public.shared_conversations 
        WHERE conversation_id = conversations.id 
        AND shared_with = auth.uid() 
        AND is_user_active(auth.uid())
      ))
    )
  )
);

-- Create team policies
CREATE POLICY "Team members can view their teams" 
ON public.teams 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = teams.id 
    AND user_id = auth.uid() 
    AND is_user_active(auth.uid())
  )
);

CREATE POLICY "Active users can create teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (auth.uid() = created_by AND is_user_active(auth.uid()));

CREATE POLICY "Team admins can update their teams" 
ON public.teams 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = teams.id 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND is_user_active(auth.uid())
  )
);

-- Create team members policies
CREATE POLICY "Team members can view team members" 
ON public.team_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = team_members.team_id 
    AND tm.user_id = auth.uid() 
    AND is_user_active(auth.uid())
  )
);

CREATE POLICY "Team admins can manage team members" 
ON public.team_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = team_members.team_id 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND is_user_active(auth.uid())
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = team_members.team_id 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND is_user_active(auth.uid())
  )
);

-- Create shared conversations policies
CREATE POLICY "Users can view conversations shared with them" 
ON public.shared_conversations 
FOR SELECT 
USING (shared_with = auth.uid() AND is_user_active(auth.uid()));

CREATE POLICY "Users can share their own conversations" 
ON public.shared_conversations 
FOR INSERT 
WITH CHECK (
  shared_by = auth.uid() 
  AND is_user_active(auth.uid()) 
  AND EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND user_id = auth.uid()
  )
);

-- Create storage policies for attachments
CREATE POLICY "Users can upload attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Attachments are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-attachments');

-- Create trigger for teams updated_at
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();