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

export interface Athlete {
  id: string;
  name: string;
}

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
