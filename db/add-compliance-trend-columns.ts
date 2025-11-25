import { getSqlClient } from './connection.js';

async function addComplianceTrendColumns() {
  const sql = await getSqlClient();
  try {
    // Add compliance and trend columns to blocks table
    await sql.query(`
      ALTER TABLE blocks 
      ADD COLUMN IF NOT EXISTS compliance integer,
      ADD COLUMN IF NOT EXISTS trend varchar(20)
    `);
    
    console.log('✅ Added compliance and trend columns to blocks table');
    
    // Populate with sample data
    const blocksResult = await sql.query('SELECT id FROM blocks');
    const blocks = Array.isArray(blocksResult) ? blocksResult : (blocksResult.rows || []);
    
    for (const block of blocks) {
      const blockId = typeof block === 'object' && block !== null ? (block as any).id : block;
      // Generate random compliance percentage (0-100)
      const compliance = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      // Generate random trend: "up", "down", "stable"
      const trends = ["up", "down", "stable"];
      const trend = trends[Math.floor(Math.random() * trends.length)];
      
      await sql.query(`
        UPDATE blocks 
        SET compliance = $1, trend = $2 
        WHERE id = $3
      `, [compliance, trend, blockId]);
    }
    
    console.log(`✅ Updated ${blocks.length} blocks with compliance and trend data`);
    console.log('✅ Database update complete!');
  } catch (error) {
    console.error('❌ Error adding compliance and trend columns:', error);
  } finally {
    if (sql && typeof (sql as any).end === 'function') {
      await (sql as any).end();
    }
  }
  process.exit(0);
}

addComplianceTrendColumns();

