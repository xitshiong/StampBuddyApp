-- Create storage bucket for merchant branding files (logos, banners)
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchant-branding', 'merchant-branding', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage bucket
-- 1. Allow anyone to read branding images
CREATE POLICY "Allow public read access to branding"
ON storage.objects FOR SELECT
USING (bucket_id = 'merchant-branding');

-- 2. Allow authenticated users to upload files
CREATE POLICY "Allow auth users to upload branding"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'merchant-branding');

-- 3. Allow authenticated users to update files
CREATE POLICY "Allow auth users to update branding"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'merchant-branding');

-- 4. Allow authenticated users to delete files
CREATE POLICY "Allow auth users to delete branding"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'merchant-branding');
