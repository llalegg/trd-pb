import { type Request, type Response } from "express";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { athletes, phases, blocks, programs } from "@shared/schema";
import { generateSeedAthletes } from "../db/seed";

const POPULATE_SECRET = process.env.POPULATE_SECRET;

async function handler(req: Request, res: Response) {
  console.log("Handler invoked - method:", req?.method, "url:", req?.url);
  
  try {
    if (!req || !res) {
      return res.status(500).json({ error: "Invalid request/response objects" });
    }
    
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }
    
    // Optional secret check for security
    if (POPULATE_SECRET) {
      const providedSecret = req.headers["x-populate-secret"] || (req.body as any)?.secret;
      if (providedSecret !== POPULATE_SECRET) {
        return res.status(401).json({ error: "Unauthorized. Provide x-populate-secret header." });
      }
    } else {
      console.warn("⚠️  WARNING: POPULATE_SECRET not set. Endpoint is open to anyone. Set POPULATE_SECRET in Vercel env vars for security.");
    }
    
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
    if (!databaseUrl) {
      return res.status(500).json({
        error: "Database URL not configured",
        details: "Please set DATABASE_URL or POSTGRES_URL in Vercel environment variables"
      });
    }
    
    console.log("Starting database population...");
    console.log("Using database URL:", databaseUrl.replace(/:[^:@]+@/, ":****@"));
    
    const sql = neon(databaseUrl);
    const db = drizzle(sql);
    
    // Generate seed data
    const seedAthletes = generateSeedAthletes();
    
    // Generate programs data (similar to MemStorage initialization)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
    
    const timestampAgo = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() - days);
      return date.toISOString();
    };
    
    const timestampFromNow = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toISOString();
    };
    
    // Create date ranges for programs
    const futureDate1 = new Date(today);
    futureDate1.setMonth(today.getMonth() + 2);
    const futureDate2 = new Date(today);
    futureDate2.setMonth(today.getMonth() + 3);
    const futureDate3 = new Date(today);
    futureDate3.setMonth(today.getMonth() + 4);
    const futureDate4 = new Date(today);
    futureDate4.setMonth(today.getMonth() + 5);
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
    
    const programsData = [
      {
        id: "1",
        programId: "P123456",
        athleteId: "1",
        athleteName: "Marcus Johnson",
        startDate: startDate1.toISOString().split('T')[0],
        endDate: futureDate1.toISOString().split('T')[0],
        routineTypes: ["movement", "throwing"],
        blockDuration: 8,
        status: "injured" as const,
        season: "Pre-Season",
        subSeason: "Early",
        lastModification: timestampAgo(3),
        lastSubmission: timestampAgo(1),
        currentDay: { block: 1, week: 2, day: 3 },
        nextBlockDue: timestampFromNow(5),
        daysComplete: 12,
        daysAvailable: 32,
      },
      {
        id: "2",
        programId: "P789012",
        athleteId: "2",
        athleteName: "Michael Chen",
        startDate: startDate2.toISOString().split('T')[0],
        endDate: futureDate2.toISOString().split('T')[0],
        routineTypes: ["lifting", "nutrition"],
        blockDuration: 12,
        status: undefined,
        season: "In-Season",
        subSeason: "Mid",
        lastModification: timestampAgo(7),
        lastSubmission: timestampAgo(2),
        currentDay: { block: 2, week: 1, day: 2 },
        nextBlockDue: timestampFromNow(12),
        daysComplete: 24,
        daysAvailable: 48,
      },
      {
        id: "3",
        programId: "P345678",
        athleteId: "3",
        athleteName: "Alexander Rodriguez",
        startDate: startDate3.toISOString().split('T')[0],
        endDate: futureDate3.toISOString().split('T')[0],
        routineTypes: ["movement", "throwing", "lifting", "nutrition"],
        blockDuration: 8,
        status: "rehabbing" as const,
        season: "Off-Season",
        subSeason: "Late",
        lastModification: timestampAgo(1),
        lastSubmission: timestampAgo(0),
        currentDay: { block: 1, week: 3, day: 1 },
        nextBlockDue: timestampFromNow(8),
        daysComplete: 18,
        daysAvailable: 32,
      },
      {
        id: "4",
        programId: "P901234",
        athleteId: "4",
        athleteName: "James Williams",
        startDate: startDate4.toISOString().split('T')[0],
        endDate: futureDate4.toISOString().split('T')[0],
        routineTypes: ["throwing", "lifting"],
        blockDuration: 12,
        status: "lingering-issues" as const,
        season: "Pre-Season",
        subSeason: undefined,
        lastModification: timestampAgo(5),
        lastSubmission: timestampAgo(3),
        currentDay: { block: 2, week: 2, day: 4 },
        nextBlockDue: timestampFromNow(15),
        daysComplete: 30,
        daysAvailable: 48,
      },
      {
        id: "5",
        programId: "P456789",
        athleteId: "5",
        athleteName: "Ryan Martinez",
        startDate: startDate5.toISOString().split('T')[0],
        endDate: futureDate5.toISOString().split('T')[0],
        routineTypes: ["movement", "lifting"],
        blockDuration: 10,
        status: undefined,
        season: "In-Season",
        subSeason: "Early",
        lastModification: timestampAgo(4),
        lastSubmission: timestampAgo(2),
        currentDay: { block: 3, week: 1, day: 1 },
        nextBlockDue: timestampFromNow(20),
        daysComplete: 28,
        daysAvailable: 40,
      },
      {
        id: "6",
        programId: "P567890",
        athleteId: "6",
        athleteName: "Ethan Thompson",
        startDate: startDate6.toISOString().split('T')[0],
        endDate: futureDate6.toISOString().split('T')[0],
        routineTypes: ["throwing", "movement", "nutrition"],
        blockDuration: 8,
        status: undefined,
        season: "Pre-Season",
        subSeason: "Mid",
        lastModification: timestampAgo(2),
        lastSubmission: timestampAgo(1),
        currentDay: { block: 1, week: 4, day: 2 },
        nextBlockDue: timestampFromNow(3),
        daysComplete: 20,
        daysAvailable: 32,
      },
      {
        id: "9",
        programId: "P234567",
        athleteId: "9",
        athleteName: "Noah Anderson",
        startDate: startDate7.toISOString().split('T')[0],
        endDate: futureDate7.toISOString().split('T')[0],
        routineTypes: ["lifting", "movement"],
        blockDuration: 12,
        status: "injured" as const,
        season: "Off-Season",
        subSeason: "Mid",
        lastModification: timestampAgo(6),
        lastSubmission: timestampAgo(4),
        currentDay: { block: 2, week: 3, day: 1 },
        nextBlockDue: timestampFromNow(10),
        daysComplete: 22,
        daysAvailable: 48,
      },
      {
        id: "10",
        programId: "P345123",
        athleteId: "10",
        athleteName: "Lucas Garcia",
        startDate: startDate8.toISOString().split('T')[0],
        endDate: futureDate8.toISOString().split('T')[0],
        routineTypes: ["throwing", "nutrition"],
        blockDuration: 8,
        status: undefined,
        season: "In-Season",
        subSeason: "Late",
        lastModification: timestampAgo(1),
        lastSubmission: timestampAgo(0),
        currentDay: { block: 1, week: 1, day: 4 },
        nextBlockDue: timestampFromNow(6),
        daysComplete: 8,
        daysAvailable: 32,
      },
      {
        id: "11",
        programId: "P456234",
        athleteId: "11",
        athleteName: "Mason Taylor",
        startDate: startDate9.toISOString().split('T')[0],
        endDate: futureDate9.toISOString().split('T')[0],
        routineTypes: ["movement", "throwing", "lifting"],
        blockDuration: 10,
        status: "rehabbing" as const,
        season: "Pre-Season",
        subSeason: "Early",
        lastModification: timestampAgo(8),
        lastSubmission: timestampAgo(5),
        currentDay: { block: 2, week: 2, day: 3 },
        nextBlockDue: timestampFromNow(18),
        daysComplete: 26,
        daysAvailable: 40,
      },
      {
        id: "12",
        programId: "P567345",
        athleteId: "12",
        athleteName: "Aiden Wilson",
        startDate: startDate10.toISOString().split('T')[0],
        endDate: futureDate10.toISOString().split('T')[0],
        routineTypes: ["lifting", "nutrition"],
        blockDuration: 12,
        status: undefined,
        season: "Off-Season",
        subSeason: "Early",
        lastModification: timestampAgo(9),
        lastSubmission: timestampAgo(6),
        currentDay: { block: 3, week: 2, day: 2 },
        nextBlockDue: timestampFromNow(25),
        daysComplete: 32,
        daysAvailable: 48,
      },
      // Completed programs
      {
        id: "7",
        programId: "P111111",
        athleteId: "7",
        athleteName: "David Lee",
        startDate: "2024-11-01",
        endDate: "2024-12-31",
        routineTypes: ["lifting"],
        blockDuration: 8,
        status: undefined,
        season: "Off-Season",
        subSeason: "Early",
        lastModification: "2024-12-15T00:00:00.000Z",
        lastSubmission: "2024-12-20T00:00:00.000Z",
        currentDay: { block: 4, week: 2, day: 3 },
        nextBlockDue: undefined,
        daysComplete: 32,
        daysAvailable: 32,
      },
      {
        id: "8",
        programId: "P222222",
        athleteId: "8",
        athleteName: "Thomas Brown",
        startDate: "2024-10-15",
        endDate: "2024-12-15",
        routineTypes: ["movement", "throwing"],
        blockDuration: 8,
        status: undefined,
        season: "In-Season",
        subSeason: "Late",
        lastModification: "2024-12-10T00:00:00.000Z",
        lastSubmission: "2024-12-12T00:00:00.000Z",
        currentDay: { block: 3, week: 4, day: 2 },
        nextBlockDue: undefined,
        daysComplete: 28,
        daysAvailable: 32,
      },
      {
        id: "13",
        programId: "P333333",
        athleteId: "13",
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
        nextBlockDue: undefined,
        daysComplete: 45,
        daysAvailable: 48,
      },
      {
        id: "14",
        programId: "P444444",
        athleteId: "14",
        athleteName: "Daniel Moore",
        startDate: "2024-08-15",
        endDate: "2024-10-15",
        routineTypes: ["movement", "nutrition"],
        blockDuration: 8,
        status: undefined,
        season: "Off-Season",
        subSeason: "Late",
        lastModification: "2024-10-10T00:00:00.000Z",
        lastSubmission: "2024-10-12T00:00:00.000Z",
        currentDay: { block: 3, week: 4, day: 4 },
        nextBlockDue: undefined,
        daysComplete: 30,
        daysAvailable: 32,
      },
      {
        id: "15",
        programId: "P555555",
        athleteId: "15",
        athleteName: "Matthew Jackson",
        startDate: "2024-07-01",
        endDate: "2024-09-30",
        routineTypes: ["lifting", "throwing"],
        blockDuration: 12,
        status: undefined,
        season: "In-Season",
        subSeason: "Early",
        lastModification: "2024-09-20T00:00:00.000Z",
        lastSubmission: "2024-09-25T00:00:00.000Z",
        currentDay: { block: 4, week: 2, day: 2 },
        nextBlockDue: undefined,
        daysComplete: 46,
        daysAvailable: 48,
      },
    ];
    
    let insertedCount = {
      athletes: 0,
      phases: 0,
      blocks: 0,
      programs: 0
    };
    
    console.log("Inserting athletes, phases, and blocks...");
    for (const athleteData of seedAthletes) {
      const athlete = athleteData.athlete;
      try {
        await db.insert(athletes).values({
          id: athlete.id,
          name: athlete.name,
          photo: athlete.photo ?? null,
          status: athlete.status ?? null,
          currentPhaseId: athlete.currentPhaseId ?? null
        }).onConflictDoNothing();
        insertedCount.athletes++;
        console.log(`✓ Inserted athlete: ${athlete.name} (${athlete.id})`);
        
        if (athleteData.currentPhase) {
          const phase = athleteData.currentPhase;
          await db.insert(phases).values({
            id: phase.id,
            athleteId: phase.athleteId,
            phaseNumber: phase.phaseNumber,
            startDate: phase.startDate,
            endDate: phase.endDate,
            status: phase.status
          }).onConflictDoNothing();
          insertedCount.phases++;
          console.log(`✓ Inserted phase: ${phase.id} for athlete ${athlete.id}`);
        }
        
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
            createdAt: new Date(block.createdAt),
            updatedAt: new Date(block.updatedAt)
          }).onConflictDoNothing();
          insertedCount.blocks++;
          console.log(`✓ Inserted block: ${block.name} (${block.id})`);
        }
      } catch (error) {
        console.error(`Error processing athlete ${athlete.id}:`, error);
      }
    }
    
    console.log("Inserting programs...");
    for (const program of programsData) {
      try {
        await db.insert(programs).values({
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
          daysAvailable: program.daysAvailable ?? null
        }).onConflictDoNothing();
        insertedCount.programs++;
        console.log(`✓ Inserted program: ${program.athleteName} (${program.programId})`);
      } catch (error) {
        console.error(`Error inserting program ${program.id}:`, error);
      }
    }
    
    console.log("Database population complete!");
    return res.status(200).json({
      success: true,
      message: "Database populated successfully",
      inserted: insertedCount
    });
  } catch (error) {
    console.error("Failed to populate database:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    return res.status(500).json({
      error: "Failed to populate database",
      details: errorMessage,
      stack: process.env.NODE_ENV === "development" ? errorStack : undefined
    });
  }
}

export default handler;

