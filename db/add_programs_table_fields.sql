-- Migration script to add new fields for Programs table redesign
-- Run this in Supabase SQL Editor or Neon SQL Editor
-- This script safely adds columns to existing tables

-- 1. Add handedness and level columns to athletes table
ALTER TABLE "athletes" 
ADD COLUMN IF NOT EXISTS "handedness" varchar(1),
ADD COLUMN IF NOT EXISTS "level" varchar(50);

-- 2. Create program_collaborators table if it doesn't exist
CREATE TABLE IF NOT EXISTS "program_collaborators" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "athlete_id" varchar NOT NULL,
  "user_id" varchar NOT NULL,
  "permission_level" varchar(20) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "program_collaborators_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "program_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- 3. Add sign-off fields to blocks table
ALTER TABLE "blocks"
ADD COLUMN IF NOT EXISTS "sign_off_status" varchar(20),
ADD COLUMN IF NOT EXISTS "sign_off_by" varchar,
ADD COLUMN IF NOT EXISTS "sign_off_at" timestamp;

-- 4. Add missing columns to blocks table if they don't exist
ALTER TABLE "blocks"
ADD COLUMN IF NOT EXISTS "last_submission" timestamp,
ADD COLUMN IF NOT EXISTS "next_block_due" timestamp;

-- Verify the changes
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND (
    (table_name = 'athletes' AND column_name IN ('handedness', 'level'))
    OR (table_name = 'program_collaborators')
    OR (table_name = 'blocks' AND column_name IN ('sign_off_status', 'sign_off_by', 'sign_off_at'))
  )
ORDER BY table_name, column_name;

