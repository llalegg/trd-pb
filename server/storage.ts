import { type User, type InsertUser, type Program, type InsertProgram, type Athlete, type Block, type Phase, type AthleteWithPhase } from "@shared/schema";
import { randomUUID } from "crypto";
import { generateSeedAthletes } from "../db/seed";
import { DbStorage } from "./dbStorage";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPrograms(): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  deleteProgram(id: string): Promise<boolean>;
  
  // New athlete-centric methods
  getAthletes(): Promise<AthleteWithPhase[]>;
  
  // Blocks CRUD methods
  getBlocksByPhase(athleteId: string, phaseId: string): Promise<Block[]>;
  createBlock(block: Omit<Block, "id" | "createdAt" | "updatedAt">): Promise<Block>;
  updateBlock(blockId: string, updates: Partial<Block>): Promise<Block | undefined>;
  deleteBlock(blockId: string): Promise<boolean>;
  signOffBlock(blockId: string): Promise<Block | undefined>;
}

function generateProgramId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `P${randomDigits}`;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private programs: Map<string, Program>;
  private athletes: Map<string, AthleteWithPhase>;
  private blocks: Map<string, Block>;

  constructor() {
    this.users = new Map();
    this.programs = new Map();
    this.athletes = new Map();
    this.blocks = new Map();
    
    // Initialize with seed athlete data
    const seedAthletes = generateSeedAthletes();
    seedAthletes.forEach(athleteData => {
      this.athletes.set(athleteData.athlete.id, athleteData);
      // Initialize blocks from seed data
      athleteData.blocks.forEach(block => {
        this.blocks.set(block.id, block);
      });
    });
    
    // Initialize with some programs
    // Active programs (endDate in the future)
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setMonth(today.getMonth() + 2); // 2 months from now
    const futureDate2 = new Date(today);
    futureDate2.setMonth(today.getMonth() + 3); // 3 months from now
    const futureDate3 = new Date(today);
    futureDate3.setMonth(today.getMonth() + 4); // 4 months from now
    const futureDate4 = new Date(today);
    futureDate4.setMonth(today.getMonth() + 5); // 5 months from now
    
    // Ensure dates are in the future
    const startDate1 = new Date(today);
    startDate1.setMonth(today.getMonth() - 1); // Started 1 month ago
    const startDate2 = new Date(today);
    startDate2.setMonth(today.getMonth() - 2); // Started 2 months ago
    const startDate3 = new Date(today);
    startDate3.setMonth(today.getMonth() - 1); // Started 1 month ago
    const startDate4 = new Date(today);
    startDate4.setMonth(today.getMonth() - 2); // Started 2 months ago
    
    // Helper to create dates relative to today
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
    
    // Create more start dates for variety
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

    const initialPrograms: Program[] = [
      // Active programs
      {
        id: "1",
        programId: "P123456",
        athleteId: "1",
        athleteName: "Marcus Johnson",
        startDate: startDate1.toISOString().split('T')[0],
        endDate: futureDate1.toISOString().split('T')[0],
        routineTypes: ["movement", "throwing"],
        blockDuration: 8,
        status: "injured",
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
        athleteId: "2",
        athleteName: "Michael Chen",
        startDate: startDate2.toISOString().split('T')[0],
        endDate: futureDate2.toISOString().split('T')[0],
        routineTypes: ["lifting", "nutrition"],
        blockDuration: 12,
        status: undefined,
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
        athleteId: "3",
        athleteName: "Alexander Rodriguez",
        startDate: startDate3.toISOString().split('T')[0],
        endDate: futureDate3.toISOString().split('T')[0],
        routineTypes: ["movement", "throwing", "lifting", "nutrition"],
        blockDuration: 8,
        status: "rehabbing",
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
        athleteId: "4",
        athleteName: "James Williams",
        startDate: startDate4.toISOString().split('T')[0],
        endDate: futureDate4.toISOString().split('T')[0],
        routineTypes: ["throwing", "lifting"],
        blockDuration: 12,
        status: "lingering-issues",
        season: "Pre-Season",
        subSeason: undefined,
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
        athleteId: "5",
        athleteName: "Ryan Martinez",
        startDate: startDate5.toISOString().split('T')[0],
        endDate: futureDate5.toISOString().split('T')[0],
        routineTypes: ["movement", "lifting"],
        blockDuration: 10,
        status: undefined,
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
        athleteId: "6",
        athleteName: "Ethan Thompson",
        startDate: startDate6.toISOString().split('T')[0],
        endDate: futureDate6.toISOString().split('T')[0],
        routineTypes: ["throwing", "movement", "nutrition"],
        blockDuration: 8,
        status: undefined,
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
        athleteId: "9",
        athleteName: "Noah Anderson",
        startDate: startDate7.toISOString().split('T')[0],
        endDate: futureDate7.toISOString().split('T')[0],
        routineTypes: ["lifting", "movement"],
        blockDuration: 12,
        status: "injured",
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
        athleteId: "10",
        athleteName: "Lucas Garcia",
        startDate: startDate8.toISOString().split('T')[0],
        endDate: futureDate8.toISOString().split('T')[0],
        routineTypes: ["throwing", "nutrition"],
        blockDuration: 8,
        status: undefined,
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
        athleteId: "11",
        athleteName: "Mason Taylor",
        startDate: startDate9.toISOString().split('T')[0],
        endDate: futureDate9.toISOString().split('T')[0],
        routineTypes: ["movement", "throwing", "lifting"],
        blockDuration: 10,
        status: "rehabbing",
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
        athleteId: "12",
        athleteName: "Aiden Wilson",
        startDate: startDate10.toISOString().split('T')[0],
        endDate: futureDate10.toISOString().split('T')[0],
        routineTypes: ["lifting", "nutrition"],
        blockDuration: 12,
        status: undefined,
        season: "Off-Season",
        subSeason: "Early",
        lastModification: daysAgo(9),
        lastSubmission: daysAgo(6),
        currentDay: { block: 3, week: 2, day: 2 },
        nextBlockDue: daysFromNow(25),
        daysComplete: 32,
        daysAvailable: 48,
      },
      // Completed programs (past end dates)
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
        status: "lingering-issues",
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
    
    initialPrograms.forEach(program => {
      this.programs.set(program.id, program);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }
  
  async getProgram(id: string): Promise<Program | undefined> {
    return this.programs.get(id);
  }
  
  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = randomUUID();
    const programId = generateProgramId();
    const program: Program = { ...insertProgram, id, programId };
    this.programs.set(id, program);
    return program;
  }
  
  async deleteProgram(id: string): Promise<boolean> {
    return this.programs.delete(id);
  }

  // Get athlete-centric data from seed data
  async getAthletes(): Promise<AthleteWithPhase[]> {
    // Return athletes from seed data
    return Array.from(this.athletes.values());
  }

  // Blocks CRUD methods
  async getBlocksByPhase(athleteId: string, phaseId: string): Promise<Block[]> {
    return Array.from(this.blocks.values()).filter(
      (block) => block.athleteId === athleteId && block.phaseId === phaseId
    );
  }

  async createBlock(blockData: Omit<Block, "id" | "createdAt" | "updatedAt">): Promise<Block> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const block: Block = {
      ...blockData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.blocks.set(id, block);
    return block;
  }

  async updateBlock(blockId: string, updates: Partial<Block>): Promise<Block | undefined> {
    const block = this.blocks.get(blockId);
    if (!block) {
      return undefined;
    }
    const updatedBlock: Block = {
      ...block,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.blocks.set(blockId, updatedBlock);
    return updatedBlock;
  }

  async deleteBlock(blockId: string): Promise<boolean> {
    return this.blocks.delete(blockId);
  }

  async signOffBlock(blockId: string): Promise<Block | undefined> {
    const block = this.blocks.get(blockId);
    if (!block) {
      return undefined;
    }
    const updatedBlock: Block = {
      ...block,
      status: "active",
      updatedAt: new Date().toISOString(),
    };
    this.blocks.set(blockId, updatedBlock);
    return updatedBlock;
  }

  private determineBlockStatus(program: Program): Block["status"] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(program.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) {
      return "complete";
    }
    
    // Default to active for existing programs
    return "active";
  }
}

// Lazy storage initialization - initialize at runtime, not at module load time
// This is critical for Vercel serverless functions where process.env is only available at runtime
let storageInstance: IStorage | null = null;

export function getStorage(): IStorage {
  if (!storageInstance) {
    storageInstance = process.env.DATABASE_URL
      ? new DbStorage(process.env.DATABASE_URL)
      : new MemStorage();
  }
  return storageInstance;
}

// Export storage for backward compatibility (will use lazy initialization)
export const storage: IStorage = new Proxy({} as IStorage, {
  get(_target, prop) {
    return getStorage()[prop as keyof IStorage];
  }
});
