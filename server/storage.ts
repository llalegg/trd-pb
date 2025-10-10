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
    const initialPrograms: Program[] = [
      {
        id: "1",
        programId: "P123456",
        athleteId: "1",
        athleteName: "Sarah Johnson",
        startDate: "2025-01-15",
        endDate: "2025-03-15",
        routineTypes: ["movement", "throwing"],
      },
      {
        id: "2",
        programId: "P789012",
        athleteId: "2",
        athleteName: "Michael Chen",
        startDate: "2025-02-01",
        endDate: "2025-04-30",
        routineTypes: ["lifting", "nutrition"],
      },
      {
        id: "3",
        programId: "P345678",
        athleteId: "3",
        athleteName: "Emma Rodriguez",
        startDate: "2025-01-20",
        endDate: "2025-03-20",
        routineTypes: ["movement", "throwing", "lifting", "nutrition"],
      },
      {
        id: "4",
        programId: "P901234",
        athleteId: "4",
        athleteName: "James Williams",
        startDate: "2025-02-15",
        endDate: "2025-05-15",
        routineTypes: ["throwing", "lifting"],
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
