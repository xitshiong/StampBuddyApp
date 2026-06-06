-- Add banner_url column to businesses for card banner images
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS banner_url text;
