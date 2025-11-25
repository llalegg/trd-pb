-- Add team column to athletes table if it doesn't exist
ALTER TABLE "athletes" 
ADD COLUMN IF NOT EXISTS "team" text;

