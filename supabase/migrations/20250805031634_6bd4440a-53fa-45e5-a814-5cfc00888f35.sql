-- Create RLS policies for storage.objects to allow file uploads

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to view files in chat buckets
CREATE POLICY "Users can view files in chat buckets" 
ON storage.objects 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('chat-images', 'chat-attachments')
);

-- Policy to allow authenticated users to upload files to chat buckets
CREATE POLICY "Users can upload files to chat buckets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('chat-images', 'chat-attachments')
);

-- Policy to allow users to update their own files
CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('chat-images', 'chat-attachments')
);

-- Policy to allow users to delete their own files  
CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('chat-images', 'chat-attachments')
);