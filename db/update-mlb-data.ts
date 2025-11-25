import { getSqlClient } from "./connection";
import { generateSeedAthletes } from "./generate-athletes";

async function updateMlbData() {
  try {
    const sql = await getSqlClient();
    
    // Generate fresh athlete data with MLB teams and positions
    const athletes = generateSeedAthletes();
    
    console.log(`Updating ${athletes.length} athletes with MLB teams and positions...`);
    
    // First, add columns if they don't exist
    try {
      await sql.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS primary_position varchar(10)`);
      await sql.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS secondary_position varchar(10)`);
      console.log("✅ Added position columns if needed");
    } catch (error) {
      console.log("Position columns may already exist, continuing...");
    }
    
    // Update athletes table with MLB data
    for (const athleteData of athletes) {
      const { athlete } = athleteData;
      
      await sql.query(
        `UPDATE athletes 
         SET team = $1, level = $2, primary_position = $3, secondary_position = $4 
         WHERE id = $5`,
        [
          athlete.team || null,
          athlete.level || null,
          athlete.primaryPosition || null,
          athlete.secondaryPosition || null,
          athlete.id
        ]
      );
    }
    
    console.log(`✅ Updated ${athletes.length} athletes with MLB teams and positions`);
    
    await sql.end();
    console.log("✅ Database update complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating database:", error);
    process.exit(1);
  }
}

updateMlbData();

