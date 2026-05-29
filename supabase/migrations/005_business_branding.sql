-- Migration 005: Business Branding Fields
-- Add new branding and customization columns to businesses table

ALTER TABLE "public"."businesses"
ADD COLUMN IF NOT EXISTS "logo_url" text,
ADD COLUMN IF NOT EXISTS "card_bg_color" text,
ADD COLUMN IF NOT EXISTS "card_accent_color" text,
ADD COLUMN IF NOT EXISTS "card_text_color" text,
ADD COLUMN IF NOT EXISTS "card_pattern" text,
ADD COLUMN IF NOT EXISTS "stamp_shape" text DEFAULT 'circle';

-- Backfill existing businesses with default brand values based on their current color
UPDATE "public"."businesses"
SET 
  "card_bg_color" = '#1c1c1e',
  "card_accent_color" = COALESCE("color", '#956afa'),
  "card_text_color" = '#ffffff',
  "stamp_shape" = 'circle'
WHERE "card_bg_color" IS NULL;
