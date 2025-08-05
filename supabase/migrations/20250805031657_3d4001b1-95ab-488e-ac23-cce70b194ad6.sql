-- Create RLS policies for storage.objects (using proper syntax for storage)

-- Policy to allow authenticated users to view files in chat buckets
CREATE POLICY "Authenticated users can view chat files" 
ON storage.objects 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('chat-images', 'chat-attachments')
);

-- Policy to allow authenticated users to upload files to chat buckets
CREATE POLICY "Authenticated users can upload chat files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('chat-images', 'chat-attachments')
);

-- Policy to allow authenticated users to update files in chat buckets
CREATE POLICY "Authenticated users can update chat files" 
ON storage.objects 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('chat-images', 'chat-attachments')
);

-- Policy to allow authenticated users to delete files in chat buckets  
CREATE POLICY "Authenticated users can delete chat files" 
ON storage.objects 
FOR DELETE 
USING (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('chat-images', 'chat-attachments')
);