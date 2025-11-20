import { getDatabaseUrl, getSqlClient } from "./connection";

async function testConnection() {
  console.log("Environment variables:");
  console.log("  DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
  console.log("  POSTGRES_URL:", process.env.POSTGRES_URL ? "set" : "not set");
  console.log("  POSTGRES_URL_NON_POOLING:", process.env.POSTGRES_URL_NON_POOLING ? "set" : "not set");
  
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error("❌ No database URL found. Set DATABASE_URL or POSTGRES_URL");
    return false;
  }
  
  console.log("\nTesting database connection...");
  console.log(`Connecting to: ${databaseUrl.replace(/:[^:@]+@/, ":****@")}`);
  
  try {
    const sql = await getSqlClient();
    const isNeon = databaseUrl.includes('neon.tech');
    
    if (isNeon) {
      // Neon uses tagged template
      const result = await sql`SELECT 1 as test`;
      console.log("✅ Connection successful!", result);
    } else {
      // Standard PostgreSQL uses query method
      const result = await sql.query('SELECT 1 as test');
      console.log("✅ Connection successful!", result);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
