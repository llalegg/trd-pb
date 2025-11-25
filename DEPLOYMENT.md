# Deployment Guide

This document describes the requirements and steps for successfully deploying the application to Vercel.

## Key Requirements

### 1. Storage Initialization Logic

The application uses **automatic database detection**. The storage system will:
- **Automatically use the database** if `DATABASE_URL` or `POSTGRES_URL` is present
- **Fall back to in-memory storage** (MemStorage) if no database URL is found
- **Force in-memory storage** only if `USE_DATABASE=false` is explicitly set

**Important**: Do NOT require `USE_DATABASE=true` for database usage. The working version (b553b7b) uses automatic detection.

### 2. Environment Variables

#### Required for Database Connection

Set ONE of these in Vercel (in order of priority):

1. **`DATABASE_URL`** - Primary database connection string
2. **`POSTGRES_URL`** - Alternative database connection string  
3. **`POSTGRES_URL_NON_POOLING`** - Non-pooled connection (for schema operations)

Example (Supabase):
```
POSTGRES_URL=postgres://postgres.fszfghooeximamptiuqb:1C44yWTBMUxqBR0f@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
```

#### Optional Environment Variables

- **`USE_DATABASE=false`** - Force in-memory storage (for testing/development)
- **`PORT`** - Server port (defaults to 3000)
- **`NODE_ENV`** - Environment mode (automatically set by Vercel)

### 3. Vercel Configuration

The `vercel.json` file is configured with:

```json
{
  "installCommand": "npm ci --legacy-peer-deps --omit=optional --omit=dev --production",
  "buildCommand": "npm install --legacy-peer-deps --include=optional && npm run build",
  "outputDirectory": "dist/public",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key points:**
- Production install omits devDependencies and optional dependencies
- Build install includes optional dependencies (needed for build process)
- API routes are handled by Express server via `/api` rewrite
- Static files are served from `dist/public`

### 4. Database Setup

#### Ensure Database is Populated

Before deployment, make sure your database has data:

1. **Check if athletes exist:**
```sql
SELECT COUNT(*) FROM athletes;
```

2. **If empty, populate the database:**
```bash
# Set environment variables locally
export POSTGRES_URL="your-connection-string"
# Or use DATABASE_URL

# Run populate script
npm run db:populate
```

### 5. Build Process

The build process:
1. Installs dependencies (including devDependencies for build)
2. Builds Vite client (`vite build`)
3. Bundles Express server (`esbuild server/index.ts`)
4. Copies `vite-setup.ts` to dist (for development mode)
5. Builds API endpoints (if they exist)
6. Outputs to `dist/` directory

**Important**: The build script handles missing API files gracefully - this is expected.

### 6. Serverless Function Wrapper

The application uses Express, which is wrapped for Vercel serverless functions:

- **`api/index.js`** - Serverless function wrapper that imports the Express app from `dist/index.js`
- **`server/index.ts`** - Exports the Express app for Vercel
- Server only starts HTTP listener when NOT on Vercel (`!process.env.VERCEL`)

### 7. Storage Behavior

#### Automatic Detection Flow:

```
1. Check if DATABASE_URL or POSTGRES_URL exists
   ├─ YES → Try to initialize DbStorage
   │   ├─ Success → Use database storage
   │   └─ Error → Fall back to MemStorage
   └─ NO → Use MemStorage (in-memory with seed data)
```

#### MemStorage Fallback:

If database connection fails or no URL is provided, the app uses `MemStorage` which:
- Contains hardcoded seed athlete data
- Provides basic functionality for testing
- **Does NOT persist data** between restarts

## Deployment Checklist

- [ ] Set `POSTGRES_URL` or `DATABASE_URL` in Vercel environment variables
- [ ] Ensure database is populated with athletes and blocks
- [ ] Verify `vercel.json` configuration is correct
- [ ] Check that build completes successfully
- [ ] Verify API endpoints respond correctly (`/api/athletes`)
- [ ] Test that athletes display on `/programs` page

## Troubleshooting

### Athletes Not Displaying

1. **Check Vercel logs** for storage initialization messages:
   - Should see: `"Using database storage"` or `"Using in-memory storage"`
   - If you see errors, check database connection string

2. **Verify database connection:**
   - Check that `POSTGRES_URL` is set correctly in Vercel
   - Ensure database is accessible from Vercel's IP ranges
   - Test connection locally with the same credentials

3. **Check database population:**
   - Run SQL query: `SELECT COUNT(*) FROM athletes;`
   - If 0, run `npm run db:populate` locally

4. **Verify API endpoint:**
   - Check `/api/athletes` endpoint in Vercel function logs
   - Should return array of athletes with blocks

### Build Errors

- **Rollup errors**: Already handled - Vite/Rollup are externalized and not bundled
- **Missing API files**: Expected - build script handles gracefully
- **Module not found**: Check that all dependencies are in `package.json`

### Runtime Errors

- **Database connection errors**: Check connection string format and SSL settings
- **Empty responses**: Check storage initialization logs
- **500 errors**: Check Vercel function logs for detailed error messages

## Working Version Reference

The last known working deployment was commit **b553b7b**. Key characteristics:

- Automatic database detection (no `USE_DATABASE` requirement)
- Simple error handling (returns errors, not empty arrays)
- Minimal logging (only essential messages)
- Express app properly exported for Vercel serverless functions

## Notes

- **Do NOT** require `USE_DATABASE=true` - use automatic detection instead
- **Do NOT** return empty arrays on errors - let errors propagate for debugging
- **Do NOT** add excessive logging - keep it minimal
- The application should work with either database or in-memory storage
- MemStorage provides seed data for testing without a database

