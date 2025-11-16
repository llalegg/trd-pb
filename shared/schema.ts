import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type BlockStatus = "draft" | "pending-signoff" | "active" | "complete";

export interface Block {
  id: string;
  athleteId: string;
  phaseId: string;
  blockNumber: number; // 1, 2, 3, 4...
  name: string; // "Pre-Season Block 1"
  
  // Dates
  startDate: string; // ISO date
  endDate: string; // ISO date
  duration: number; // weeks (2-4)
  
  // Season info
  season: "Pre-Season" | "In-Season" | "Off-Season" | "Redshirt";
  subSeason?: "Early" | "Mid" | "Late" | "General Off-Season (GOS)";
  
  // Status
  status: BlockStatus;
  currentDay?: {
    week: number;
    day: number;
  };
  
  // Template configuration
  throwing?: {
    xRole: string;
    phase: string;
    exclusions?: string;
  };
  movement?: {
    intensity: string;
    volume: string;
  };
  lifting?: {
    split: string; // "4x2", "3x2", "2x2"
    emphasis: string; // "Restorative", "Strength", etc.
    variability: string;
    scheme: string;
  };
  conditioning?: {
    coreEmphasis: string;
    adaptation: string;
    method: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastModification?: string;
}

export interface Phase {
  id: string;
  athleteId: string;
  phaseNumber: number; // 1, 2, 3... (Year 1, Year 2...)
  startDate: string;
  endDate: string;
  status: "active" | "complete" | "future";
}

export interface Athlete {
  id: string;
  name: string;
  photo?: string; // URL or path to athlete photo
  status?: "injured" | "rehabbing" | "lingering-issues" | null; // Only shown when relevant
  currentPhaseId?: string;
  phases?: Phase[];
}

// Legacy Program interface for backward compatibility
export interface Program {
  id: string;
  programId: string;
  athleteId: string;
  athleteName: string;
  startDate: string;
  endDate: string;
  routineTypes: string[];
  blockDuration: number;
  // New fields for enhanced program list view
  status?: "injured" | "rehabbing" | "lingering-issues" | null; // Only shown when relevant
  season?: string; // e.g., "Pre-Season", "In-Season", "Off-Season"
  subSeason?: string; // e.g., "Early", "Mid", "Late"
  lastModification?: string; // ISO date string - when coach last changed the program
  lastSubmission?: string; // ISO date string - when athlete last submitted data
  currentDay?: {
    block: number;
    week: number;
    day: number;
  };
  nextBlockDue?: string; // ISO date string - when next block needs to be reviewed/approved
  daysComplete?: number; // Number of days completed in current phase
  daysAvailable?: number; // Total number of days programming available in phase
}

export type InsertProgram = Omit<Program, "id" | "programId">;

// New athlete-centric response type
export interface AthleteWithPhase {
  athlete: Athlete;
  currentPhase?: Phase;
  blocks: Block[];
}
