-- Políticas para permitir upload de imagens do chat
CREATE POLICY "Usuários autenticados podem fazer upload de imagens do chat" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuários autenticados podem visualizar imagens do chat" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-images');

CREATE POLICY "Usuários podem atualizar suas próprias imagens" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'chat-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuários podem deletar suas próprias imagens" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-images' 
  AND auth.uid() IS NOT NULL
);

-- Políticas para permitir upload de anexos do chat
CREATE POLICY "Usuários autenticados podem fazer upload de anexos do chat" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuários autenticados podem visualizar anexos do chat" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-attachments');

CREATE POLICY "Usuários podem atualizar seus próprios anexos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'chat-attachments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuários podem deletar seus próprios anexos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-attachments' 
  AND auth.uid() IS NOT NULL
);