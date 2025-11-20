# Vercel Deployment Guide

## Required Environment Variables

For the application to connect to your database on Vercel, you must set the following environment variables in your Vercel project settings:

### Database Connection

- **`DATABASE_URL`** or **`POSTGRES_URL`** (required)
  - Your Supabase/PostgreSQL connection string
  - Example: `postgresql://user:password@host:5432/database`
  - The application will automatically use the database if this is set

### Optional Environment Variables

- **`USE_DATABASE`** (optional)
  - Set to `"false"` to force using in-memory storage (for testing)
  - Default behavior: Uses database if `DATABASE_URL` is present
  - If not set and `DATABASE_URL` is present, database will be used automatically

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `DATABASE_URL` or `POSTGRES_URL` with your database connection string
   - (Optional) `USE_DATABASE=false` if you want to disable database usage

## Storage Behavior

- **If `DATABASE_URL` is set**: The application will use `DbStorage` (database)
- **If `DATABASE_URL` is not set**: The application will use `MemStorage` (in-memory, no data persistence)
- **If `USE_DATABASE=false`**: The application will use `MemStorage` even if `DATABASE_URL` is set

## Troubleshooting

### No Athletes Showing on Vercel

If you see "No Athletes found" on your deployed Vercel site:

1. Check that `DATABASE_URL` or `POSTGRES_URL` is set in Vercel environment variables
2. Verify the connection string is correct and accessible
3. Check Vercel function logs for database connection errors
4. Ensure `USE_DATABASE` is not set to `"false"`

### Rollup Native Dependency Error

If you see errors about `@rollup/rollup-linux-x64-gnu`:

- This dependency is now included as a regular dependency and should install automatically on Vercel
- If errors persist, check that the build completes successfully
- The dependency is Linux-specific and won't install on macOS/Windows locally (this is expected)

