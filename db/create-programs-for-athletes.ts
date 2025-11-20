import { getDatabaseConnection } from "./connection";
import { athletes, phases, blocks, programs } from "../shared/schema";
import { eq } from "drizzle-orm";

// Generate a program ID
function generateProgramId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `P${randomDigits}`;
}

async function createProgramsForAllAthletes() {
  const db = await getDatabaseConnection();
  
  console.log("Fetching athletes and existing programs...");
  const allAthletes = await db.select().from(athletes);
  const existingPrograms = await db.select().from(programs);
  const existingAthleteIds = new Set(existingPrograms.map(p => p.athleteId));
  
  console.log(`Found ${allAthletes.length} athletes`);
  console.log(`Found ${existingPrograms.length} existing programs`);
  console.log(`Need to create ${allAthletes.length - existingPrograms.length} programs`);
  
  // Get all phases and blocks
  const allPhases = await db.select().from(phases);
  const allBlocks = await db.select().from(blocks);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let created = 0;
  let skipped = 0;
  
  for (const athlete of allAthletes) {
    // Skip if athlete already has a program
    if (existingAthleteIds.has(athlete.id)) {
      skipped++;
      continue;
    }
    
    // Find athlete's current phase
    const athletePhases = allPhases.filter(p => p.athleteId === athlete.id);
    const currentPhase = athlete.currentPhaseId
      ? athletePhases.find(p => p.id === athlete.currentPhaseId)
      : athletePhases[0];
    
    if (!currentPhase) {
      console.log(`⚠️  Skipping ${athlete.name} (${athlete.id}): No phase found`);
      skipped++;
      continue;
    }
    
    // Find athlete's blocks for the current phase
    const athleteBlocks = allBlocks.filter(b => 
      b.athleteId === athlete.id && b.phaseId === currentPhase.id
    );
    
    if (athleteBlocks.length === 0) {
      console.log(`⚠️  Skipping ${athlete.name} (${athlete.id}): No blocks found`);
      skipped++;
      continue;
    }
    
    // Calculate program dates from phase
    const phaseStart = new Date(currentPhase.startDate);
    const phaseEnd = new Date(currentPhase.endDate);
    
    // Calculate block duration (sum of all block durations)
    const blockDuration = athleteBlocks.reduce((sum, block) => sum + (block.duration || 4), 0);
    
    // Find current block
    const currentBlock = athleteBlocks.find(b => b.status === "active") || athleteBlocks[0];
    
    // Determine routine types based on blocks
    const routineTypes: string[] = [];
    athleteBlocks.forEach(block => {
      if (block.throwing) routineTypes.push("throwing");
      if (block.movement) routineTypes.push("movement");
      if (block.lifting) routineTypes.push("lifting");
      if (block.conditioning) routineTypes.push("conditioning");
    });
    const uniqueRoutineTypes = [...new Set(routineTypes)];
    
    // Calculate days complete and available
    const daysComplete = athleteBlocks.reduce((sum, block) => {
      if (block.status === "complete") {
        return sum + (block.duration || 0);
      }
      return sum;
    }, 0);
    
    const daysAvailable = blockDuration;
    
    // Find next block due
    const sortedBlocks = [...athleteBlocks].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    const nextBlock = sortedBlocks.find(b => {
      const startDate = new Date(b.startDate);
      return startDate > today && (b.status === "draft" || b.status === "planned");
    });
    
    // Get last modification from blocks (blocks have lastModification field)
    const lastModification = athleteBlocks
      .map(b => b.lastModification ? new Date(b.lastModification) : null)
      .filter(d => d !== null)
      .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;
    
    // lastSubmission is not on blocks, set to null or use a default
    const lastSubmission = null;
    
    // Determine program status based on blocks
    let programStatus: "active" | "draft" | "complete" | null = null;
    if (athleteBlocks.some(b => b.status === "active")) {
      programStatus = "active";
    } else if (athleteBlocks.some(b => b.status === "draft")) {
      programStatus = "draft";
    } else if (athleteBlocks.every(b => b.status === "complete")) {
      programStatus = "complete";
    }
    
    // Get season and subSeason from current block
    const season = currentBlock.season || null;
    const subSeason = currentBlock.subSeason || null;
    
    // Get current day from current block
    const currentDay = currentBlock.currentDay || null;
    
    try {
      await db.insert(programs).values({
        id: `program-${athlete.id}`,
        programId: generateProgramId(),
        athleteId: athlete.id,
        athleteName: athlete.name,
        startDate: phaseStart.toISOString().split('T')[0],
        endDate: phaseEnd.toISOString().split('T')[0],
        routineTypes: uniqueRoutineTypes.length > 0 ? uniqueRoutineTypes : ["lifting"],
        blockDuration,
        status: programStatus,
        season,
        subSeason,
        lastModification: lastModification,
        lastSubmission: lastSubmission,
        currentDay,
        nextBlockDue: nextBlock ? new Date(nextBlock.startDate) : null,
        daysComplete,
        daysAvailable,
      });
      
      console.log(`✅ Created program for ${athlete.name} (${athlete.id})`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating program for ${athlete.name} (${athlete.id}):`, error);
    }
  }
  
  console.log(`\n✅ Summary:`);
  console.log(`   Created: ${created} programs`);
  console.log(`   Skipped: ${skipped} athletes (already had programs or missing data)`);
  console.log(`   Total programs: ${existingPrograms.length + created}`);
}

createProgramsForAllAthletes()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

