import { type User, type InsertUser, type Program, type InsertProgram } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

function generateProgramId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `P${randomDigits}`;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private programs: Map<string, Program>;

  constructor() {
    this.users = new Map();
    this.programs = new Map();
    
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
    
    const initialPrograms: Program[] = [
      // Active programs - exactly 4
      {
        id: "1",
        programId: "P123456",
        athleteId: "1",
        athleteName: "Marcus Johnson",
        startDate: startDate1.toISOString().split('T')[0],
        endDate: futureDate1.toISOString().split('T')[0],
        routineTypes: ["movement", "throwing"],
        blockDuration: 8,
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
}

export const storage = new MemStorage();
