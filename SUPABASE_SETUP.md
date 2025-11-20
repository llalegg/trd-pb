# Supabase Database Setup Guide

## ✅ Configuration

Your project is now configured to use **Supabase** (PostgreSQL) instead of Neon.

## 🚀 Quick Start

### Step 1: Set Environment Variables

Create `.env.development.local` or export them:

```bash
# For regular operations (pooled connection)
export POSTGRES_URL="postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"

# For schema creation/migrations (non-pooled)
export POSTGRES_URL_NON_POOLING="postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Or use DATABASE_URL (scripts support both)
export DATABASE_URL="postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
```

### Step 2: Create Database Schema

**Option A: Using Supabase SQL Editor (Recommended)**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project → SQL Editor
3. Copy the contents of `db/schema.sql`
4. Paste and run in SQL Editor

**Option B: Using Command Line**

```bash
export POSTGRES_URL_NON_POOLING="postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
npm run db:create-schema
```

### Step 3: Populate Database

```bash
export POSTGRES_URL="postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
npm run db:populate
```

This will insert:
- ✅ 12 athletes
- ✅ Associated phases
- ✅ Associated blocks
- ✅ 15 programs

### Step 4: Verify Data

In Supabase SQL Editor, run:

```sql
-- Check counts
SELECT 'athletes' as table_name, COUNT(*) as count FROM athletes
UNION ALL
SELECT 'phases', COUNT(*) FROM phases
UNION ALL
SELECT 'blocks', COUNT(*) FROM blocks
UNION ALL
SELECT 'programs', COUNT(*) FROM programs;

-- View sample data
SELECT * FROM athletes LIMIT 5;
SELECT * FROM programs LIMIT 5;
```

## 📝 Available Scripts

- `npm run db:create-schema` - Create tables via script
- `npm run db:populate` - Populate database with seed data
- `npx tsx db/test-connection.ts` - Test database connection

## 🔧 Environment Variables Support

The scripts support multiple environment variable names for flexibility:

1. `DATABASE_URL` - Generic database URL
2. `POSTGRES_URL` - Supabase pooled connection (for regular operations)
3. `POSTGRES_URL_NON_POOLING` - Supabase non-pooled connection (for schema creation)

**Priority**: `DATABASE_URL` → `POSTGRES_URL_NON_POOLING` → `POSTGRES_URL`

## 🎯 Enable Database Storage in App

After populating, enable database storage:

```bash
export USE_DATABASE=true
export POSTGRES_URL="postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
npm run dev
```

## 🔗 Supabase Resources

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase SQL Editor](https://supabase.com/dashboard/project/fszfghooeximamptiuqb/sql)
- [Supabase Documentation](https://supabase.com/docs)

## 📊 Connection Strings

### Pooled Connection (Regular Operations)
```
postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
```

### Non-Pooled Connection (Schema Creation/Migrations)
```
postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## ⚠️ Important Notes

1. **Use non-pooled connection for schema creation** - Pooled connections (port 6543) may not support all DDL operations
2. **Use pooled connection for regular operations** - Better performance and connection management
3. **Supabase doesn't auto-pause** - Unlike Neon, Supabase databases stay active, so no need to wake them up

