-- Migration to drop team column from athletes table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Or run via Neon SQL Editor: https://console.neon.tech

-- Drop team column from athletes table (if exists)
ALTER TABLE athletes 
DROP COLUMN IF EXISTS team;

-- Verify the column was dropped
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'athletes' AND column_name = 'team';
-- Should return no rows if column was successfully dropped

