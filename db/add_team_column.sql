-- Migration to add team column to athletes table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Or run via Neon SQL Editor: https://console.neon.tech

-- Add team column to athletes table (if not exists)
ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS team text;

-- Verify the column was added
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'athletes' AND column_name = 'team';

