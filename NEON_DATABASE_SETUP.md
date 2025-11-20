# Neon Database Population Guide

## Current Status

The populate script is ready to use, but the database connection is currently timing out. This is likely because:

1. **Database is paused**: Neon databases auto-pause after inactivity and need to be woken up
2. **Network connectivity**: There may be firewall or network issues

## Steps to Populate Database

### Step 1: Wake Up Your Neon Database

1. Go to your [Neon Dashboard](https://console.neon.tech)
2. Navigate to your project
3. If the database shows as "Paused", click "Resume" or make a query to wake it up
4. Wait a few seconds for the database to fully start

### Step 2: Set Environment Variables

Create a `.env` file in the project root (or export them):

```bash
DATABASE_URL="postgresql://neondb_owner:npg_wc8Rx9uQgTGm@ep-wandering-block-ahresvbh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Or use the unpooled connection for bulk operations:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_wc8Rx9uQgTGm@ep-wandering-block-ahresvbh.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Step 3: Test Connection

```bash
npm run db:populate
```

Or test the connection first:

```bash
npx tsx db/test-connection.ts
```

### Step 4: Run Population

Once the connection test succeeds, run:

```bash
npm run db:populate
```

This will populate:
- ✅ Athletes (12 athletes)
- ✅ Phases (associated with athletes)
- ✅ Blocks (associated with phases)
- ✅ Programs (15 programs)

## Troubleshooting

### Connection Timeouts

If you see `ETIMEDOUT` errors:
1. **Wake up the database** via Neon dashboard
2. **Check network connectivity** - ensure you can reach Neon's servers
3. **Try the unpooled connection** instead of the pooler
4. **Wait a few seconds** after waking up before retrying

### Database Schema

If you get schema errors, ensure migrations are applied. However, `drizzle-kit push` may not work with Neon's serverless setup. You may need to:
- Apply migrations manually via Neon SQL editor
- Or use the migrations SQL files in `migrations/` folder

## Connection Strings Available

- **Pooled** (recommended for most uses): `ep-wandering-block-ahresvbh-pooler.c-3.us-east-1.aws.neon.tech`
- **Unpooled** (for migrations/bulk operations): `ep-wandering-block-ahresvbh.c-3.us-east-1.aws.neon.tech`

## Next Steps After Population

Once populated, enable database storage in your app:

```bash
USE_DATABASE=true
DATABASE_URL="your-neon-url"
```

Then restart your dev server.

