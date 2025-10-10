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
}

export type InsertProgram = Omit<Program, "id" | "programId">;
