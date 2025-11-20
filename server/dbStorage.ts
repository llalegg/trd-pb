import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";
import type {
  User,
  InsertUser,
  Program,
  InsertProgram,
  Athlete,
  Block,
  Phase,
  AthleteWithPhase,
} from "@shared/schema";
import {
  users,
  athletes,
  phases,
  blocks,
  programs,
} from "@shared/schema";
import { getDatabaseConnection } from "../db/connection";

function generateProgramId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `P${randomDigits}`;
}

export class DbStorage implements IStorage {
  private dbPromise: Promise<any>;

  constructor(databaseUrl: string) {
    // Store the database URL in environment for connection utility
    // The connection utility will read from env vars
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      // Temporarily set it if not already set
      process.env.DATABASE_URL = databaseUrl;
    }
    this.dbPromise = getDatabaseConnection();
  }

  private async getDb() {
    return await this.dbPromise;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const db = await this.getDb();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.getDb();
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({ id, ...insertUser })
      .returning();
    return user;
  }

  // Program methods
  async getPrograms(): Promise<Program[]> {
    const db = await this.getDb();
    const dbPrograms = await db.select().from(programs);
    return dbPrograms.map(this.mapDbProgramToProgram);
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const db = await this.getDb();
    const result = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id))
      .limit(1);
    return result[0] ? this.mapDbProgramToProgram(result[0]) : undefined;
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const db = await this.getDb();
    const id = randomUUID();
    const programId = generateProgramId();
    const [dbProgram] = await db
      .insert(programs)
      .values({
        id,
        programId,
        athleteId: insertProgram.athleteId,
        athleteName: insertProgram.athleteName,
        startDate: insertProgram.startDate,
        endDate: insertProgram.endDate,
        routineTypes: insertProgram.routineTypes,
        blockDuration: insertProgram.blockDuration,
        status: insertProgram.status ?? null,
        season: insertProgram.season ?? null,
        subSeason: insertProgram.subSeason ?? null,
        lastModification: insertProgram.lastModification
          ? new Date(insertProgram.lastModification)
          : null,
        lastSubmission: insertProgram.lastSubmission
          ? new Date(insertProgram.lastSubmission)
          : null,
        currentDay: insertProgram.currentDay ?? null,
        nextBlockDue: insertProgram.nextBlockDue
          ? new Date(insertProgram.nextBlockDue)
          : null,
        daysComplete: insertProgram.daysComplete ?? null,
        daysAvailable: insertProgram.daysAvailable ?? null,
      })
      .returning();
    return this.mapDbProgramToProgram(dbProgram);
  }

  async deleteProgram(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.delete(programs).where(eq(programs.id, id)).returning();
    return result.length > 0;
  }

  // Athlete methods
  async getAthletes(): Promise<AthleteWithPhase[]> {
    const db = await this.getDb();
    const dbAthletes = await db.select().from(athletes);
    const dbPhases = await db.select().from(phases);
    const dbBlocks = await db.select().from(blocks);

    return dbAthletes.map((athlete) => {
      const athletePhases = dbPhases
        .filter((p) => p.athleteId === athlete.id)
        .map(this.mapDbPhaseToPhase);

      const currentPhase = athlete.currentPhaseId
        ? athletePhases.find((p) => p.id === athlete.currentPhaseId)
        : undefined;

      const athleteBlocks = dbBlocks
        .filter((b) => b.athleteId === athlete.id)
        .map(this.mapDbBlockToBlock);

      const phaseBlocks = currentPhase
        ? athleteBlocks.filter((b) => b.phaseId === currentPhase.id)
        : [];

      return {
        athlete: this.mapDbAthleteToAthlete(athlete, athletePhases),
        currentPhase: currentPhase ?? undefined,
        blocks: phaseBlocks,
      };
    });
  }

  // Block methods
  async getBlocksByPhase(athleteId: string, phaseId: string): Promise<Block[]> {
    const db = await this.getDb();
    const dbBlocks = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.athleteId, athleteId), eq(blocks.phaseId, phaseId)));
    return dbBlocks.map(this.mapDbBlockToBlock);
  }

  async createBlock(
    blockData: Omit<Block, "id" | "createdAt" | "updatedAt">
  ): Promise<Block> {
    const db = await this.getDb();
    const id = randomUUID();
    const now = new Date();

    const [dbBlock] = await db
      .insert(blocks)
      .values({
        id,
        athleteId: blockData.athleteId,
        phaseId: blockData.phaseId,
        blockNumber: blockData.blockNumber,
        name: blockData.name,
        startDate: blockData.startDate,
        endDate: blockData.endDate,
        duration: blockData.duration,
        season: blockData.season,
        subSeason: blockData.subSeason ?? null,
        status: blockData.status,
        currentDay: blockData.currentDay ?? null,
        throwing: blockData.throwing ?? null,
        movement: blockData.movement ?? null,
        lifting: blockData.lifting ?? null,
        conditioning: blockData.conditioning ?? null,
        lastModification: blockData.lastModification
          ? new Date(blockData.lastModification)
          : null,
        lastSubmission: blockData.lastSubmission
          ? new Date(blockData.lastSubmission)
          : null,
        nextBlockDue: blockData.nextBlockDue
          ? new Date(blockData.nextBlockDue)
          : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return this.mapDbBlockToBlock(dbBlock);
  }

  async updateBlock(
    blockId: string,
    updates: Partial<Block>
  ): Promise<Block | undefined> {
    const db = await this.getDb();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.blockNumber !== undefined) updateData.blockNumber = updates.blockNumber;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate;
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.season !== undefined) updateData.season = updates.season;
    if (updates.subSeason !== undefined) updateData.subSeason = updates.subSeason;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.currentDay !== undefined) updateData.currentDay = updates.currentDay;
    if (updates.throwing !== undefined) updateData.throwing = updates.throwing;
    if (updates.movement !== undefined) updateData.movement = updates.movement;
    if (updates.lifting !== undefined) updateData.lifting = updates.lifting;
    if (updates.conditioning !== undefined) updateData.conditioning = updates.conditioning;
    if (updates.lastModification !== undefined)
      updateData.lastModification = updates.lastModification
        ? new Date(updates.lastModification)
        : null;
    if (updates.lastSubmission !== undefined)
      updateData.lastSubmission = updates.lastSubmission
        ? new Date(updates.lastSubmission)
        : null;
    if (updates.nextBlockDue !== undefined)
      updateData.nextBlockDue = updates.nextBlockDue
        ? new Date(updates.nextBlockDue)
        : null;

    const result = await db
      .update(blocks)
      .set(updateData)
      .where(eq(blocks.id, blockId))
      .returning();

    return result[0] ? this.mapDbBlockToBlock(result[0]) : undefined;
  }

  async deleteBlock(blockId: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.delete(blocks).where(eq(blocks.id, blockId)).returning();
    return result.length > 0;
  }

  // Helper methods to map database types to TypeScript interfaces
  private mapDbProgramToProgram(dbProgram: typeof programs.$inferSelect): Program {
    return {
      id: dbProgram.id,
      programId: dbProgram.programId,
      athleteId: dbProgram.athleteId,
      athleteName: dbProgram.athleteName,
      startDate: dbProgram.startDate,
      endDate: dbProgram.endDate,
      routineTypes: dbProgram.routineTypes as string[],
      blockDuration: dbProgram.blockDuration,
      status: dbProgram.status as Program["status"],
      season: dbProgram.season ?? undefined,
      subSeason: dbProgram.subSeason ?? undefined,
      lastModification: dbProgram.lastModification?.toISOString(),
      lastSubmission: dbProgram.lastSubmission?.toISOString(),
      currentDay: dbProgram.currentDay as Program["currentDay"],
      nextBlockDue: dbProgram.nextBlockDue?.toISOString(),
      daysComplete: dbProgram.daysComplete ?? undefined,
      daysAvailable: dbProgram.daysAvailable ?? undefined,
    };
  }

  private mapDbAthleteToAthlete(
    dbAthlete: typeof athletes.$inferSelect,
    phasesList: Phase[]
  ): Athlete {
    return {
      id: dbAthlete.id,
      name: dbAthlete.name,
      photo: dbAthlete.photo ?? undefined,
      status: dbAthlete.status as Athlete["status"],
      currentPhaseId: dbAthlete.currentPhaseId ?? undefined,
      phases: phasesList,
    };
  }

  private mapDbPhaseToPhase(dbPhase: typeof phases.$inferSelect): Phase {
    return {
      id: dbPhase.id,
      athleteId: dbPhase.athleteId,
      phaseNumber: dbPhase.phaseNumber,
      startDate: dbPhase.startDate,
      endDate: dbPhase.endDate,
      status: dbPhase.status as Phase["status"],
    };
  }

  private mapDbBlockToBlock(dbBlock: typeof blocks.$inferSelect): Block {
    return {
      id: dbBlock.id,
      athleteId: dbBlock.athleteId,
      phaseId: dbBlock.phaseId,
      blockNumber: dbBlock.blockNumber,
      name: dbBlock.name,
      startDate: dbBlock.startDate,
      endDate: dbBlock.endDate,
      duration: dbBlock.duration,
      season: dbBlock.season as Block["season"],
      subSeason: dbBlock.subSeason as Block["subSeason"],
      status: dbBlock.status as Block["status"],
      currentDay: dbBlock.currentDay as Block["currentDay"],
      throwing: dbBlock.throwing as Block["throwing"],
      movement: dbBlock.movement as Block["movement"],
      lifting: dbBlock.lifting as Block["lifting"],
      conditioning: dbBlock.conditioning as Block["conditioning"],
      lastModification: dbBlock.lastModification?.toISOString(),
      lastSubmission: dbBlock.lastSubmission?.toISOString(),
      nextBlockDue: dbBlock.nextBlockDue?.toISOString(),
      createdAt: dbBlock.createdAt.toISOString(),
      updatedAt: dbBlock.updatedAt.toISOString(),
    };
  }
}

