/*
  # Create storage bucket for document uploads

  1. New Storage
    - Create 'documents' bucket for storing ID documents
  2. Security
    - Enable authenticated users to upload documents
    - Enable authenticated users to read their own documents
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('documents', 'documents')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can read their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);