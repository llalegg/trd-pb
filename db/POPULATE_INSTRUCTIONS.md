# Database Population Instructions

## Overview
This guide explains how to populate your Supabase database with all the required data for the programs table, including the new fields: `team` (athletes), `lastSubmission` (blocks), and `nextBlockDue` (blocks).

## Step 1: Run Database Migration

First, you need to add the missing columns to your database schema:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `db/add_missing_columns.sql`
4. Run the SQL script

This will add:
- `team` column to the `athletes` table
- `last_submission` column to the `blocks` table
- `next_block_due` column to the `blocks` table

## Step 2: Populate Database

You have two options to populate the database:

### Option A: Use the Populate Script (Recommended)

Run the populate script which will insert all athletes, phases, blocks, and programs:

```bash
# Make sure you have DATABASE_URL or POSTGRES_URL set in your environment
export DATABASE_URL="your-supabase-connection-string"
# or
export POSTGRES_URL="your-supabase-connection-string"

# Run the populate script
npm run populate
# or
tsx db/populate.ts
```

### Option B: Use Generated SQL

Generate SQL INSERT statements and run them manually:

```bash
# Generate SQL file
tsx db/generate-sql.ts

# This creates db/generated_inserts.sql
# Copy the contents and run in Supabase SQL Editor
```

## Step 3: Verify Data

After populating, verify the data was inserted correctly:

```sql
-- Check athletes count
SELECT COUNT(*) FROM athletes;

-- Check blocks count
SELECT COUNT(*) FROM blocks;

-- Check if team column has data
SELECT COUNT(*) FROM athletes WHERE team IS NOT NULL;

-- Check if last_submission and next_block_due have data
SELECT COUNT(*) FROM blocks WHERE last_submission IS NOT NULL;
SELECT COUNT(*) FROM blocks WHERE next_block_due IS NOT NULL;
```

## Data Structure

The populate script will create:
- **60 athletes** with random names, teams, and statuses
- **Phases** for each athlete (1 phase per athlete)
- **Blocks** for each athlete (1-4 blocks per athlete)
- **Programs** (legacy table, for backward compatibility)

### New Fields Populated:

1. **Athlete `team`**: Randomly assigned from: "Varsity", "JV", "Freshman", "Redshirt", "Transfer"
2. **Block `lastSubmission`**: Random date within last 7 days (for active blocks only)
3. **Block `nextBlockDue`**: Random date 1-14 days in the future (for active blocks with upcoming blocks)

## Environment Variables

Make sure you have one of these set:
- `DATABASE_URL` - Standard PostgreSQL connection string
- `POSTGRES_URL` - Supabase connection string
- `POSTGRES_URL_NON_POOLING` - Supabase non-pooling connection string

## Troubleshooting

If you encounter errors:

1. **Connection timeout**: The database might be paused. Wait a moment and try again.
2. **Column doesn't exist**: Make sure you ran the migration SQL first (Step 1).
3. **Duplicate key errors**: The script uses `ON CONFLICT DO NOTHING`, so existing data won't be overwritten.

## Next Steps

After populating:
1. Set `USE_DATABASE=true` in your environment variables
2. Restart your development server
3. Navigate to `/programs` to see the populated table

