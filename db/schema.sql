-- Database Schema for ProgramBuilder
-- Run this in Neon SQL Editor: https://console.neon.tech
-- Make sure your database is awake before running!

-- 1. Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "username" text NOT NULL,
  "password" text NOT NULL,
  CONSTRAINT "users_username_unique" UNIQUE("username")
);

-- 2. Athletes table (no dependencies)
CREATE TABLE IF NOT EXISTS "athletes" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "photo" text,
  "status" varchar(50),
  "current_phase_id" varchar,
  "handedness" varchar(1),
  "level" varchar(50)
);

-- 3. Phases table (depends on athletes)
CREATE TABLE IF NOT EXISTS "phases" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "athlete_id" varchar NOT NULL,
  "phase_number" integer NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "status" varchar(20) NOT NULL,
  CONSTRAINT "phases_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE cascade ON UPDATE no action
);

-- 4. Blocks table (depends on athletes and phases)
CREATE TABLE IF NOT EXISTS "blocks" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "athlete_id" varchar NOT NULL,
  "phase_id" varchar NOT NULL,
  "block_number" integer NOT NULL,
  "name" text NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "duration" integer NOT NULL,
  "season" varchar(20) NOT NULL,
  "sub_season" varchar(50),
  "status" varchar(20) NOT NULL,
  "current_day" jsonb,
  "throwing" jsonb,
  "movement" jsonb,
  "lifting" jsonb,
  "conditioning" jsonb,
  "last_modification" timestamp,
  "last_submission" timestamp,
  "next_block_due" timestamp,
  "sign_off_status" varchar(20),
  "sign_off_by" varchar,
  "sign_off_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "blocks_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "blocks_phase_id_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE cascade ON UPDATE no action
);

-- 5. Programs table (depends on athletes)
CREATE TABLE IF NOT EXISTS "programs" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "program_id" varchar NOT NULL,
  "athlete_id" varchar NOT NULL,
  "athlete_name" text NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "routine_types" jsonb NOT NULL,
  "block_duration" integer NOT NULL,
  "status" varchar(50),
  "season" varchar(50),
  "sub_season" varchar(50),
  "last_modification" timestamp,
  "last_submission" timestamp,
  "current_day" jsonb,
  "next_block_due" timestamp,
  "days_complete" integer,
  "days_available" integer,
  CONSTRAINT "programs_program_id_unique" UNIQUE("program_id"),
  CONSTRAINT "programs_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE cascade ON UPDATE no action
);

-- 6. Program collaborators table (depends on athletes and users)
CREATE TABLE IF NOT EXISTS "program_collaborators" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "athlete_id" varchar NOT NULL,
  "user_id" varchar NOT NULL,
  "permission_level" varchar(20) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "program_collaborators_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "program_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

