import { DbStorage } from "../server/dbStorage";
import { generateSeedAthletes } from "./seed";

import { getDatabaseUrl } from "./connection";

// Support both DATABASE_URL and POSTGRES_URL (Supabase uses POSTGRES_URL)
const databaseUrl = getDatabaseUrl();
if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL environment variable is required");
}

// Helper function to retry database operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 2000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      if (error?.code === 'ETIMEDOUT' || error?.message?.includes('fetch failed')) {
        console.log(`Connection timeout, retrying in ${delayMs}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

async function populateDatabase() {
  console.log("Connecting to database...");
  console.log("Note: If database is paused, it may take a moment to wake up...");
  
  // Test connection first with retry
  try {
    const { getSqlClient } = await import("./connection");
    const sql = await getSqlClient();
    const dbUrl = getDatabaseUrl();
    const isNeon = dbUrl.includes('neon.tech');
    
    await retryOperation(async () => {
      if (isNeon) {
        await sql`SELECT 1`;
      } else {
        await sql.query('SELECT 1');
      }
      console.log("✅ Database connection successful!");
    });
  } catch (error) {
    console.error("❌ Failed to connect to database after retries.");
    console.error("Please ensure:");
    console.error("1. The database is accessible (check Supabase dashboard)");
    console.error("2. Your network can reach Supabase servers");
    console.error("3. The DATABASE_URL or POSTGRES_URL is correct");
    throw error;
  }
  
  const storage = new DbStorage(databaseUrl);

  console.log("Populating athletes, phases, and blocks from seed data...");
  const seedAthletes = generateSeedAthletes();

  // Insert athletes, phases, and blocks
  for (const athleteData of seedAthletes) {
    // Insert athlete
    const athlete = athleteData.athlete;
    try {
      // Note: We'll need to insert athletes directly using Drizzle since DbStorage doesn't have a createAthlete method
      // For now, we'll use the storage methods that exist
      console.log(`Processing athlete: ${athlete.name} (${athlete.id})`);
      
      // Insert phase
      if (athleteData.currentPhase) {
        const phase = athleteData.currentPhase;
        // We'll need to insert phases and athletes directly - let me check the dbStorage implementation
        // Actually, let me use a different approach - insert via direct Drizzle calls
      }
    } catch (error) {
      console.error(`Error processing athlete ${athlete.id}:`, error);
    }
  }

  // Insert programs
  console.log("Populating programs...");
  const today = new Date();
  const daysAgo = (days: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };
  
  const daysFromNow = (days: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  const futureDate1 = new Date(today);
  futureDate1.setMonth(today.getMonth() + 2);
  const futureDate2 = new Date(today);
  futureDate2.setMonth(today.getMonth() + 3);
  const futureDate3 = new Date(today);
  futureDate3.setMonth(today.getMonth() + 4);
  const futureDate4 = new Date(today);
  futureDate4.setMonth(today.getMonth() + 5);
  const startDate1 = new Date(today);
  startDate1.setMonth(today.getMonth() - 1);
  const startDate2 = new Date(today);
  startDate2.setMonth(today.getMonth() - 2);
  const startDate3 = new Date(today);
  startDate3.setMonth(today.getMonth() - 1);
  const startDate4 = new Date(today);
  startDate4.setMonth(today.getMonth() - 2);
  const startDate5 = new Date(today);
  startDate5.setMonth(today.getMonth() - 3);
  const startDate6 = new Date(today);
  startDate6.setMonth(today.getMonth() - 1);
  const startDate7 = new Date(today);
  startDate7.setMonth(today.getMonth() - 2);
  const startDate8 = new Date(today);
  startDate8.setMonth(today.getMonth() - 1);
  const startDate9 = new Date(today);
  startDate9.setMonth(today.getMonth() - 2);
  const startDate10 = new Date(today);
  startDate10.setMonth(today.getMonth() - 3);
  const futureDate5 = new Date(today);
  futureDate5.setMonth(today.getMonth() + 6);
  const futureDate6 = new Date(today);
  futureDate6.setMonth(today.getMonth() + 2);
  const futureDate7 = new Date(today);
  futureDate7.setMonth(today.getMonth() + 3);
  const futureDate8 = new Date(today);
  futureDate8.setMonth(today.getMonth() + 4);
  const futureDate9 = new Date(today);
  futureDate9.setMonth(today.getMonth() + 5);
  const futureDate10 = new Date(today);
  futureDate10.setMonth(today.getMonth() + 6);

  const programs = [
    {
      id: "1",
      programId: "P123456",
      athleteId: "athlete-1",
      athleteName: "Marcus Johnson",
      startDate: startDate1.toISOString().split('T')[0],
      endDate: futureDate1.toISOString().split('T')[0],
      routineTypes: ["movement", "throwing"],
      blockDuration: 8,
      status: "injured" as const,
      season: "Pre-Season",
      subSeason: "Early",
      lastModification: daysAgo(3),
      lastSubmission: daysAgo(1),
      currentDay: { block: 1, week: 2, day: 3 },
      nextBlockDue: daysFromNow(5),
      daysComplete: 12,
      daysAvailable: 32,
    },
    {
      id: "2",
      programId: "P789012",
      athleteId: "athlete-2",
      athleteName: "Samuel Chen",
      startDate: startDate2.toISOString().split('T')[0],
      endDate: futureDate2.toISOString().split('T')[0],
      routineTypes: ["lifting", "nutrition"],
      blockDuration: 12,
      status: null,
      season: "In-Season",
      subSeason: "Mid",
      lastModification: daysAgo(7),
      lastSubmission: daysAgo(2),
      currentDay: { block: 2, week: 1, day: 2 },
      nextBlockDue: daysFromNow(12),
      daysComplete: 24,
      daysAvailable: 48,
    },
    {
      id: "3",
      programId: "P345678",
      athleteId: "athlete-3",
      athleteName: "James Rodriguez",
      startDate: startDate3.toISOString().split('T')[0],
      endDate: futureDate3.toISOString().split('T')[0],
      routineTypes: ["movement", "throwing", "lifting", "nutrition"],
      blockDuration: 8,
      status: "rehabbing" as const,
      season: "Off-Season",
      subSeason: "Late",
      lastModification: daysAgo(1),
      lastSubmission: daysAgo(0),
      currentDay: { block: 1, week: 3, day: 1 },
      nextBlockDue: daysFromNow(8),
      daysComplete: 18,
      daysAvailable: 32,
    },
    {
      id: "4",
      programId: "P901234",
      athleteId: "athlete-4",
      athleteName: "Casey Davis",
      startDate: startDate4.toISOString().split('T')[0],
      endDate: futureDate4.toISOString().split('T')[0],
      routineTypes: ["throwing", "lifting"],
      blockDuration: 12,
      status: "lingering-issues" as const,
      season: "Pre-Season",
      subSeason: null,
      lastModification: daysAgo(5),
      lastSubmission: daysAgo(3),
      currentDay: { block: 2, week: 2, day: 4 },
      nextBlockDue: daysFromNow(15),
      daysComplete: 30,
      daysAvailable: 48,
    },
    {
      id: "5",
      programId: "P456789",
      athleteId: "athlete-5",
      athleteName: "Alex Thompson",
      startDate: startDate5.toISOString().split('T')[0],
      endDate: futureDate5.toISOString().split('T')[0],
      routineTypes: ["movement", "lifting"],
      blockDuration: 10,
      status: null,
      season: "In-Season",
      subSeason: "Early",
      lastModification: daysAgo(4),
      lastSubmission: daysAgo(2),
      currentDay: { block: 3, week: 1, day: 1 },
      nextBlockDue: daysFromNow(20),
      daysComplete: 28,
      daysAvailable: 40,
    },
    {
      id: "6",
      programId: "P567890",
      athleteId: "athlete-6",
      athleteName: "Michael Lee",
      startDate: startDate6.toISOString().split('T')[0],
      endDate: futureDate6.toISOString().split('T')[0],
      routineTypes: ["throwing", "movement", "nutrition"],
      blockDuration: 8,
      status: null,
      season: "Pre-Season",
      subSeason: "Mid",
      lastModification: daysAgo(2),
      lastSubmission: daysAgo(1),
      currentDay: { block: 1, week: 4, day: 2 },
      nextBlockDue: daysFromNow(3),
      daysComplete: 20,
      daysAvailable: 32,
    },
    {
      id: "9",
      programId: "P234567",
      athleteId: "athlete-9",
      athleteName: "Ethan Martinez",
      startDate: startDate7.toISOString().split('T')[0],
      endDate: futureDate7.toISOString().split('T')[0],
      routineTypes: ["lifting", "movement"],
      blockDuration: 12,
      status: "injured" as const,
      season: "Off-Season",
      subSeason: "Mid",
      lastModification: daysAgo(6),
      lastSubmission: daysAgo(4),
      currentDay: { block: 2, week: 3, day: 1 },
      nextBlockDue: daysFromNow(10),
      daysComplete: 22,
      daysAvailable: 48,
    },
    {
      id: "10",
      programId: "P345123",
      athleteId: "athlete-10",
      athleteName: "Tyler Brown",
      startDate: startDate8.toISOString().split('T')[0],
      endDate: futureDate8.toISOString().split('T')[0],
      routineTypes: ["throwing", "nutrition"],
      blockDuration: 8,
      status: null,
      season: "In-Season",
      subSeason: "Late",
      lastModification: daysAgo(1),
      lastSubmission: daysAgo(0),
      currentDay: { block: 1, week: 1, day: 4 },
      nextBlockDue: daysFromNow(6),
      daysComplete: 8,
      daysAvailable: 32,
    },
    {
      id: "11",
      programId: "P456234",
      athleteId: "athlete-11",
      athleteName: "Robert Martinez",
      startDate: startDate9.toISOString().split('T')[0],
      endDate: futureDate9.toISOString().split('T')[0],
      routineTypes: ["movement", "throwing", "lifting"],
      blockDuration: 10,
      status: "rehabbing" as const,
      season: "Pre-Season",
      subSeason: "Early",
      lastModification: daysAgo(8),
      lastSubmission: daysAgo(5),
      currentDay: { block: 2, week: 2, day: 3 },
      nextBlockDue: daysFromNow(18),
      daysComplete: 26,
      daysAvailable: 40,
    },
    {
      id: "12",
      programId: "P567345",
      athleteId: "athlete-12",
      athleteName: "Christopher Wilson",
      startDate: startDate10.toISOString().split('T')[0],
      endDate: futureDate10.toISOString().split('T')[0],
      routineTypes: ["lifting", "nutrition"],
      blockDuration: 12,
      status: null,
      season: "Off-Season",
      subSeason: "Early",
      lastModification: daysAgo(9),
      lastSubmission: daysAgo(6),
      currentDay: { block: 3, week: 2, day: 2 },
      nextBlockDue: daysFromNow(25),
      daysComplete: 32,
      daysAvailable: 48,
    },
    {
      id: "7",
      programId: "P111111",
      athleteId: "athlete-7",
      athleteName: "David Kim",
      startDate: "2024-11-01",
      endDate: "2024-12-31",
      routineTypes: ["lifting"],
      blockDuration: 8,
      status: null,
      season: "Off-Season",
      subSeason: "Early",
      lastModification: "2024-12-15T00:00:00.000Z",
      lastSubmission: "2024-12-20T00:00:00.000Z",
      currentDay: { block: 4, week: 2, day: 3 },
      nextBlockDue: null,
      daysComplete: 32,
      daysAvailable: 32,
    },
    {
      id: "8",
      programId: "P222222",
      athleteId: "athlete-8",
      athleteName: "Jordan Williams",
      startDate: "2024-10-15",
      endDate: "2024-12-15",
      routineTypes: ["movement", "throwing"],
      blockDuration: 8,
      status: null,
      season: "In-Season",
      subSeason: "Late",
      lastModification: "2024-12-10T00:00:00.000Z",
      lastSubmission: "2024-12-12T00:00:00.000Z",
      currentDay: { block: 3, week: 4, day: 2 },
      nextBlockDue: null,
      daysComplete: 28,
      daysAvailable: 32,
    },
    {
      id: "13",
      programId: "P333333",
      athleteId: "athlete-13",
      athleteName: "Christopher Davis",
      startDate: "2024-09-01",
      endDate: "2024-11-30",
      routineTypes: ["throwing", "lifting", "movement"],
      blockDuration: 12,
      status: "lingering-issues" as const,
      season: "Pre-Season",
      subSeason: "Mid",
      lastModification: "2024-11-25T00:00:00.000Z",
      lastSubmission: "2024-11-28T00:00:00.000Z",
      currentDay: { block: 4, week: 3, day: 1 },
      nextBlockDue: null,
      daysComplete: 45,
      daysAvailable: 48,
    },
    {
      id: "14",
      programId: "P444444",
      athleteId: "athlete-14",
      athleteName: "Daniel Moore",
      startDate: "2024-08-15",
      endDate: "2024-10-15",
      routineTypes: ["movement", "nutrition"],
      blockDuration: 8,
      status: null,
      season: "Off-Season",
      subSeason: "Late",
      lastModification: "2024-10-10T00:00:00.000Z",
      lastSubmission: "2024-10-12T00:00:00.000Z",
      currentDay: { block: 3, week: 4, day: 4 },
      nextBlockDue: null,
      daysComplete: 30,
      daysAvailable: 32,
    },
    {
      id: "15",
      programId: "P555555",
      athleteId: "athlete-15",
      athleteName: "Matthew Jackson",
      startDate: "2024-07-01",
      endDate: "2024-09-30",
      routineTypes: ["lifting", "throwing"],
      blockDuration: 12,
      status: null,
      season: "In-Season",
      subSeason: "Early",
      lastModification: "2024-09-20T00:00:00.000Z",
      lastSubmission: "2024-09-25T00:00:00.000Z",
      currentDay: { block: 4, week: 2, day: 2 },
      nextBlockDue: null,
      daysComplete: 46,
      daysAvailable: 48,
    },
  ];

  // Insert athletes, phases, blocks, and programs using direct Drizzle
  const { getDatabaseConnection } = await import("./connection");
  const { athletes, phases, blocks, programs: programsTable } = await import("../shared/schema");
  
  const db = await getDatabaseConnection();

  // Insert programs directly to preserve specific IDs and programIds
  console.log("Populating programs...");
  for (const program of programs) {
    try {
      await db.insert(programsTable).values({
        id: program.id,
        programId: program.programId,
        athleteId: program.athleteId,
        athleteName: program.athleteName,
        startDate: program.startDate,
        endDate: program.endDate,
        routineTypes: program.routineTypes,
        blockDuration: program.blockDuration,
        status: program.status ?? null,
        season: program.season ?? null,
        subSeason: program.subSeason ?? null,
        lastModification: program.lastModification ? new Date(program.lastModification) : null,
        lastSubmission: program.lastSubmission ? new Date(program.lastSubmission) : null,
        currentDay: program.currentDay ?? null,
        nextBlockDue: program.nextBlockDue ? new Date(program.nextBlockDue) : null,
        daysComplete: program.daysComplete ?? null,
        daysAvailable: program.daysAvailable ?? null,
      }).onConflictDoNothing();
      console.log(`Inserted program: ${program.athleteName} (${program.programId})`);
    } catch (error) {
      console.error(`Error inserting program ${program.id}:`, error);
    }
  }

  for (const athleteData of seedAthletes) {
    const athlete = athleteData.athlete;
    try {
      // Insert athlete
      await db.insert(athletes).values({
        id: athlete.id,
        name: athlete.name,
        photo: athlete.photo ?? null,
        status: athlete.status ?? null,
        currentPhaseId: athlete.currentPhaseId ?? null,
        team: athlete.team ?? null,
      }).onConflictDoNothing();
      console.log(`Inserted athlete: ${athlete.name} (${athlete.id})`);

      // Insert phase
      if (athleteData.currentPhase) {
        const phase = athleteData.currentPhase;
        await db.insert(phases).values({
          id: phase.id,
          athleteId: phase.athleteId,
          phaseNumber: phase.phaseNumber,
          startDate: phase.startDate,
          endDate: phase.endDate,
          status: phase.status,
        }).onConflictDoNothing();
        console.log(`Inserted phase: ${phase.id} for athlete ${athlete.id}`);
      }

      // Insert blocks
      for (const block of athleteData.blocks) {
        await db.insert(blocks).values({
          id: block.id,
          athleteId: block.athleteId,
          phaseId: block.phaseId,
          blockNumber: block.blockNumber,
          name: block.name,
          startDate: block.startDate,
          endDate: block.endDate,
          duration: block.duration,
          season: block.season,
          subSeason: block.subSeason ?? null,
          status: block.status,
          currentDay: block.currentDay ?? null,
          throwing: block.throwing ?? null,
          movement: block.movement ?? null,
          lifting: block.lifting ?? null,
          conditioning: block.conditioning ?? null,
          lastModification: block.lastModification ? new Date(block.lastModification) : null,
          lastSubmission: block.lastSubmission ? new Date(block.lastSubmission) : null,
          nextBlockDue: block.nextBlockDue ? new Date(block.nextBlockDue) : null,
          createdAt: new Date(block.createdAt),
          updatedAt: new Date(block.updatedAt),
        }).onConflictDoNothing();
        console.log(`Inserted block: ${block.name} (${block.id})`);
      }
    } catch (error) {
      console.error(`Error processing athlete ${athlete.id}:`, error);
    }
  }

  console.log("Database population complete!");
}

populateDatabase().catch(console.error);

