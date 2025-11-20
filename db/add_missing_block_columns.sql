-- Migration to add missing columns to blocks table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Or run via Neon SQL Editor: https://console.neon.tech

-- Add last_submission and next_block_due columns to blocks table (if not exists)
ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS last_submission timestamp;

ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS next_block_due timestamp;

-- Verify columns were added
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'blocks' AND column_name IN ('last_submission', 'next_block_due')
ORDER BY column_name;

