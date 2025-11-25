import { getSqlClient } from "./connection";
import { generateSeedAthletes } from "./generate-athletes";

async function updateAthletesData() {
  try {
    const sql = await getSqlClient();
    
    // Generate fresh athlete data with team, level, photos, and sign-off
    const athletes = generateSeedAthletes();
    
    console.log(`Updating ${athletes.length} athletes with team, level, and photos...`);
    
    // Update athletes table
    for (const athleteData of athletes) {
      const { athlete } = athleteData;
      
      await sql.query(
        `UPDATE athletes 
         SET team = $1, level = $2, photo = $3 
         WHERE id = $4`,
        [
          athlete.team || null,
          athlete.level || null,
          athlete.photo || null,
          athlete.id
        ]
      );
    }
    
    console.log(`✅ Updated ${athletes.length} athletes`);
    
    // Update blocks with sign-off status
    console.log(`Updating blocks with sign-off status...`);
    let blocksUpdated = 0;
    
    for (const athleteData of athletes) {
      for (const block of athleteData.blocks) {
        if (block.signOffStatus || block.signOffBy || block.signOffAt) {
          await sql.query(
            `UPDATE blocks 
             SET sign_off_status = $1, sign_off_by = $2, sign_off_at = $3 
             WHERE id = $4`,
            [
              block.signOffStatus || null,
              block.signOffBy || null,
              block.signOffAt ? new Date(block.signOffAt) : null,
              block.id
            ]
          );
          blocksUpdated++;
        }
      }
    }
    
    console.log(`✅ Updated ${blocksUpdated} blocks with sign-off data`);
    
    // Ensure lastSubmission is populated for active blocks
    console.log(`Ensuring lastSubmission is populated for active blocks...`);
    let submissionsUpdated = 0;
    
    for (const athleteData of athletes) {
      for (const block of athleteData.blocks) {
        if (block.status === "active" && block.lastSubmission) {
          await sql.query(
            `UPDATE blocks 
             SET last_submission = $1 
             WHERE id = $2 AND last_submission IS NULL`,
            [
              new Date(block.lastSubmission),
              block.id
            ]
          );
          submissionsUpdated++;
        }
      }
    }
    
    console.log(`✅ Updated ${submissionsUpdated} blocks with lastSubmission`);
    
    await sql.end();
    console.log("✅ Database update complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating database:", error);
    process.exit(1);
  }
}

updateAthletesData();

