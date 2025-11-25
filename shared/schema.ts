import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
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

export type BlockStatus = "draft" | "active" | "planned" | "complete";

// Athletes table
export const athletes = pgTable("athletes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  photo: text("photo"),
  status: varchar("status", { length: 50 }), // "injured" | "rehabbing" | "lingering-issues" | null
  currentPhaseId: varchar("current_phase_id"),
  team: text("team"), // Current athlete team (e.g., "Minnesota Twins (AAA)")
  handedness: varchar("handedness", { length: 1 }), // "R" | "L"
  level: varchar("level", { length: 50 }), // "MLB" | "AAA" | "AA" | "A" | "Rookie" | "Free Agent"
  primaryPosition: varchar("primary_position", { length: 10 }), // "RHP" | "LHP" | "C" | "1B" | "2B" | "SS" | "3B" | "OF"
  secondaryPosition: varchar("secondary_position", { length: 10 }), // Secondary position
});

// Phases table
export const phases = pgTable("phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  phaseNumber: integer("phase_number").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // "active" | "complete" | "future"
});

// Blocks table
export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  phaseId: varchar("phase_id").notNull().references(() => phases.id, { onDelete: "cascade" }),
  blockNumber: integer("block_number").notNull(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  duration: integer("duration").notNull(),
  season: varchar("season", { length: 20 }).notNull(), // "Pre-Season" | "In-Season" | "Off-Season" | "Redshirt"
  subSeason: varchar("sub_season", { length: 50 }), // "Early" | "Mid" | "Late" | "General Off-Season (GOS)"
  status: varchar("status", { length: 20 }).notNull(), // "draft" | "active" | "planned" | "complete"
  currentDay: jsonb("current_day"), // { week: number, day: number }
  throwing: jsonb("throwing"), // { xRole: string, phase: string, exclusions?: string }
  movement: jsonb("movement"), // { intensity: string, volume: string }
  lifting: jsonb("lifting"), // { split: string, emphasis: string, variability: string, scheme: string }
  conditioning: jsonb("conditioning"), // { coreEmphasis: string, adaptation: string, method: string }
  lastModification: timestamp("last_modification"),
  lastSubmission: timestamp("last_submission"), // When athlete last submitted data
  nextBlockDue: timestamp("next_block_due"), // When next block needs to be reviewed/approved
  signOffStatus: varchar("sign_off_status", { length: 20 }), // "pending" | "approved" | "rejected"
  signOffBy: varchar("sign_off_by"), // user_id
  signOffAt: timestamp("sign_off_at"), // timestamp of sign-off
  compliance: integer("compliance"), // Compliance percentage (0-100)
  trend: varchar("trend", { length: 20 }), // "up" | "down" | "stable"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Programs table (legacy, for backward compatibility)
export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull().unique(),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  athleteName: text("athlete_name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  routineTypes: jsonb("routine_types").notNull(), // string[]
  blockDuration: integer("block_duration").notNull(),
  status: varchar("status", { length: 50 }), // "injured" | "rehabbing" | "lingering-issues" | null
  season: varchar("season", { length: 50 }),
  subSeason: varchar("sub_season", { length: 50 }),
  lastModification: timestamp("last_modification"),
  lastSubmission: timestamp("last_submission"),
  currentDay: jsonb("current_day"), // { block: number, week: number, day: number }
  nextBlockDue: timestamp("next_block_due"),
  daysComplete: integer("days_complete"),
  daysAvailable: integer("days_available"),
});

// Program collaborators table
export const programCollaborators = pgTable("program_collaborators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  permissionLevel: varchar("permission_level", { length: 20 }).notNull(), // "view" | "edit" | "admin"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
  lastSubmission?: string; // ISO date string - when athlete last submitted data
  nextBlockDue?: string; // ISO date string - when next block needs to be reviewed/approved
  signOffStatus?: "pending" | "approved" | "rejected";
  signOffBy?: string; // user_id
  signOffAt?: string; // ISO date string - timestamp of sign-off
  compliance?: number; // Compliance percentage (0-100)
  trend?: "up" | "down" | "stable"; // Trend direction
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
  team?: string; // Current athlete team (e.g., "Minnesota Twins (AAA)")
  handedness?: "R" | "L"; // Right or Left handed
  level?: string; // "MLB" | "AAA" | "AA" | "A" | "Rookie" | "Free Agent"
  primaryPosition?: string; // "RHP" | "LHP" | "C" | "1B" | "2B" | "SS" | "3B" | "OF"
  secondaryPosition?: string; // Secondary position
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

// Program collaborator interface
export interface ProgramCollaborator {
  id: string;
  athleteId: string;
  userId: string;
  permissionLevel: "view" | "edit" | "admin";
  createdAt: string;
  user?: User; // Populated user data
}

// New athlete-centric response type
export interface AthleteWithPhase {
  athlete: Athlete;
  currentPhase?: Phase;
  blocks: Block[];
  collaborators?: ProgramCollaborator[];
}
