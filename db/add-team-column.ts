import { getSqlClient } from "./connection";

async function addMissingColumns() {
  try {
    const sql = await getSqlClient();
    
    // Add missing columns to athletes table
    await sql.query('ALTER TABLE athletes ADD COLUMN IF NOT EXISTS team text');
    await sql.query('ALTER TABLE athletes ADD COLUMN IF NOT EXISTS handedness varchar(1)');
    await sql.query('ALTER TABLE athletes ADD COLUMN IF NOT EXISTS level varchar(50)');
    
    // Add missing columns to blocks table
    await sql.query('ALTER TABLE blocks ADD COLUMN IF NOT EXISTS sign_off_status varchar(20)');
    await sql.query('ALTER TABLE blocks ADD COLUMN IF NOT EXISTS sign_off_by varchar');
    await sql.query('ALTER TABLE blocks ADD COLUMN IF NOT EXISTS sign_off_at timestamp');
    await sql.query('ALTER TABLE blocks ADD COLUMN IF NOT EXISTS last_submission timestamp');
    await sql.query('ALTER TABLE blocks ADD COLUMN IF NOT EXISTS next_block_due timestamp');
    
    console.log('✅ All missing columns added successfully');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addMissingColumns();

