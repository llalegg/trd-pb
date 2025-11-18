import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_wc8Rx9uQgTGm@ep-wandering-block-ahresvbh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function testConnection() {
  console.log("Testing connection to Neon database...");
  console.log("Connection string:", databaseUrl.replace(/:[^:@]+@/, ':****@'));
  
  try {
    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log("✅ Connection successful!");
    console.log("Current time:", result[0].current_time);
    console.log("PostgreSQL version:", result[0].pg_version.split(' ')[0] + " " + result[0].pg_version.split(' ')[1]);
    return true;
  } catch (error: any) {
    console.error("❌ Connection failed:");
    console.error("Error:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});

