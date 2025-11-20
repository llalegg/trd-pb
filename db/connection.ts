/**
 * Database connection utility
 * Supports both Neon (via @neondatabase/serverless) and Supabase/Standard PostgreSQL (via pg)
 */

// Function to get database URL dynamically (reads from env each time)
export function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
}

// Support both DATABASE_URL and POSTGRES_URL (Supabase uses POSTGRES_URL)
const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL environment variable is required");
}

// Detect if it's a Neon connection (contains 'neon.tech') or Supabase/standard PostgreSQL
const isNeon = databaseUrl.includes('neon.tech');
const isSupabase = databaseUrl.includes('supabase.co') || databaseUrl.includes('supabase.com');

export async function getDatabaseConnection() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) throw new Error("Database URL not found");
  const isNeonConn = dbUrl.includes('neon.tech');
  
  if (isNeonConn) {
    // Use Neon serverless driver
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const sql = neon(dbUrl);
    return drizzle(sql);
  } else {
    // Use standard PostgreSQL driver (for Supabase and other PostgreSQL)
    const pg = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const Pool = pg.default?.Pool || pg.Pool;
    
    // Parse connection string - remove sslmode from URL and configure SSL separately
    const url = new URL(dbUrl.replace(/^postgres:\/\//, 'https://'));
    url.searchParams.delete('sslmode');
    
    const poolConfig: any = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove leading /
      user: url.username,
      password: url.password,
    };
    
    // For Supabase, configure SSL to accept self-signed certificates
    if (dbUrl.includes('supabase')) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
    } else {
      poolConfig.ssl = true;
    }
    
    const pool = new Pool(poolConfig);
    return drizzle(pool);
  }
}

export async function getSqlClient() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) throw new Error("Database URL not found");
  const isNeonConn = dbUrl.includes('neon.tech');
  
  if (isNeonConn) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(dbUrl);
    // Add raw method for template literal support
    (sql as any).raw = (str: string) => str;
    return sql;
  } else {
    const pg = await import("pg");
    const Pool = pg.default?.Pool || pg.Pool;
    
    // Parse connection string - remove sslmode from URL and configure SSL separately
    const url = new URL(dbUrl.replace(/^postgres:\/\//, 'https://'));
    url.searchParams.delete('sslmode');
    
    const poolConfig: any = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove leading /
      user: url.username,
      password: url.password,
    };
    
    // For Supabase, configure SSL to accept self-signed certificates
    if (dbUrl.includes('supabase')) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
    } else {
      poolConfig.ssl = true;
    }
    
    const pool = new Pool(poolConfig);
    
    // Return a compatible SQL client
    return {
      async query(text: string, params?: any[]) {
        const result = await pool.query(text, params);
        return result.rows;
      },
      async end() {
        await pool.end();
      },
    };
  }
}

export { getDatabaseUrl as databaseUrl };

