# Neon Database Setup - Complete Guide

## ✅ What's Ready

1. ✅ `@neondatabase/serverless` is installed
2. ✅ Database connection scripts are ready
3. ✅ Schema SQL file created (`db/schema.sql`)
4. ✅ Populate script ready (`db/populate.ts`)

## 🚀 Step-by-Step Setup

### Step 1: Wake Up Your Neon Database

**IMPORTANT**: Neon databases auto-pause after inactivity. You must wake it up first!

1. Go to [Neon Console](https://console.neon.tech)
2. Navigate to your project
3. If the database shows as "Paused" or "Sleeping":
   - Click "Resume" or run any query in SQL Editor
   - Wait 10-15 seconds for it to fully start
4. You'll know it's awake when queries execute successfully

### Step 2: Create Database Schema

**Option A: Using Neon SQL Editor (Recommended)**

1. Open [Neon SQL Editor](https://console.neon.tech)
2. Copy the entire contents of `db/schema.sql`
3. Paste into SQL Editor
4. Click "Run" or press `Cmd/Ctrl + Enter`
5. Verify tables were created - you should see:
   - users
   - athletes
   - phases
   - blocks
   - programs

**Option B: Using Command Line**

Once database is awake, run:

```bash
export DATABASE_URL="postgresql://neondb_owner:npg_wc8Rx9uQgTGm@ep-wandering-block-ahresvbh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
npm run db:create-schema
```

### Step 3: Populate Database

Once schema is created and database is awake:

```bash
export DATABASE_URL="postgresql://neondb_owner:npg_wc8Rx9uQgTGm@ep-wandering-block-ahresvbh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
npm run db:populate
```

This will insert:
- ✅ 12 athletes
- ✅ Associated phases
- ✅ Associated blocks  
- ✅ 15 programs

### Step 4: Verify Data

In Neon SQL Editor, run:

```sql
-- Check athletes
SELECT COUNT(*) FROM athletes;

-- Check phases
SELECT COUNT(*) FROM phases;

-- Check blocks
SELECT COUNT(*) FROM blocks;

-- Check programs
SELECT COUNT(*) FROM programs;

-- View sample data
SELECT * FROM athletes LIMIT 5;
SELECT * FROM programs LIMIT 5;
```

## 🔧 Troubleshooting

### Connection Timeout Errors

If you see `ETIMEDOUT` or `fetch failed`:

1. **Database is paused** - Wake it up in Neon Console
2. **Network issues** - Check your internet connection
3. **Wait time** - After waking up, wait 10-15 seconds before retrying

### Schema Already Exists

If tables already exist, the scripts use `CREATE TABLE IF NOT EXISTS` so it's safe to run again.

### Foreign Key Errors

Make sure tables are created in this order:
1. users
2. athletes
3. phases (depends on athletes)
4. blocks (depends on athletes and phases)
5. programs (depends on athletes)

## 📝 Environment Variables

For local development, create `.env.development.local`:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_wc8Rx9uQgTGm@ep-wandering-block-ahresvbh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Or export it before running commands:

```bash
export DATABASE_URL="postgresql://neondb_owner:npg_wc8Rx9uQgTGm@ep-wandering-block-ahresvbh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

## 🎯 Next Steps

After populating:

1. **Enable database storage** in your app:
   ```bash
   export USE_DATABASE=true
   export DATABASE_URL="your-neon-url"
   ```

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

3. **Test the API**:
   - `GET /api/athletes` - Should return populated athletes
   - `GET /api/programs` - Should return populated programs

## 📚 Available Scripts

- `npm run db:create-schema` - Create tables via script
- `npm run db:populate` - Populate database with seed data
- `npx tsx db/test-connection.ts` - Test database connection

## 🔗 Useful Links

- [Neon Console](https://console.neon.tech)
- [Neon SQL Editor](https://console.neon.tech)
- [Neon Documentation](https://neon.tech/docs)

