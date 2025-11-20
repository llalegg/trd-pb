-- Migration to add missing columns for programs table
-- Run this in your Supabase SQL Editor

-- Add team column to athletes table (if not exists)
ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS team text;

-- Add last_submission and next_block_due columns to blocks table (if not exists)
ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS last_submission timestamp;

ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS next_block_due timestamp;

-- Verify columns were added
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'athletes' AND column_name IN ('team')
UNION ALL
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'blocks' AND column_name IN ('last_submission', 'next_block_due');

