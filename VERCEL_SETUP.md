# Vercel Deployment Setup Guide

## Problem: Athletes Not Displaying on /programs Page

If athletes are not showing up on the deployed `/programs` page, it's likely because the database connection is not configured in Vercel.

## Required Environment Variables

You **MUST** set these environment variables in your Vercel project settings:

### 1. Enable Database Storage
```
USE_DATABASE=true
```

### 2. Set Database Connection URL
Choose ONE of these (in order of priority):

**Option A: Use DATABASE_URL**
```
DATABASE_URL=postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
```

**Option B: Use POSTGRES_URL**
```
POSTGRES_URL=postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
```

**Option C: Use POSTGRES_URL_NON_POOLING** (for schema operations)
```
POSTGRES_URL_NON_POOLING=postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add the following variables:
   - `USE_DATABASE` = `true`
   - `POSTGRES_URL` = `[your Supabase connection string]`
4. Make sure to select **Production**, **Preview**, and **Development** environments
5. Click **Save**
6. **Redeploy** your application (Vercel will automatically redeploy when you save env vars, or you can trigger a manual redeploy)

## Verify Database is Populated

After setting environment variables, make sure your Supabase database has data:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Run this query to check if athletes exist:
```sql
SELECT COUNT(*) FROM athletes;
```

If the count is 0, you need to populate the database:
```bash
# Set environment variables locally
export USE_DATABASE=true
export POSTGRES_URL="postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"

# Run populate script
npm run db:populate
```

## Debugging

### Check Vercel Logs

1. Go to your Vercel project → **Deployments** → Click on the latest deployment
2. Click **Functions** tab
3. Look for logs containing:
   - `[Storage] Initializing storage`
   - `[API] /api/athletes - Request received`
   - `[API] /api/athletes - Returning X athletes`

### What to Look For

**If you see:**
```
[Storage] USE_DATABASE not set to 'true', using MemStorage
[Storage] No database URL found (check DATABASE_URL or POSTGRES_URL)
```
→ Environment variables are not set correctly

**If you see:**
```
[Storage] Attempting to use database storage
[Storage] Database storage initialized successfully
[API] /api/athletes - Returning 0 athletes
```
→ Database is connected but empty (run populate script)

**If you see:**
```
[Storage] Failed to initialize DbStorage, falling back to MemStorage
```
→ Database connection failed (check connection string)

## Fallback Behavior

If database connection fails or environment variables are not set, the app will:
- Fall back to `MemStorage` (in-memory storage with seed data)
- This should still show athletes, but they won't persist

If even `MemStorage` shows no athletes, there's a code issue that needs debugging.

## Quick Fix Checklist

- [ ] `USE_DATABASE=true` is set in Vercel
- [ ] `POSTGRES_URL` (or `DATABASE_URL`) is set in Vercel
- [ ] Environment variables are set for **Production** environment
- [ ] Application has been **redeployed** after setting env vars
- [ ] Database is populated (check with SQL query)
- [ ] Check Vercel logs for errors

## Support

If athletes still don't show after following these steps:
1. Check Vercel function logs for detailed error messages
2. Verify database connection string is correct
3. Test database connection locally with the same credentials
4. Check browser console for frontend errors

