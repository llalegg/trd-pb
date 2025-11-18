import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import type { AthleteWithPhase } from "@shared/schema";

const insertProgramSchema = z.object({
  athleteId: z.string(),
  athleteName: z.string(),
  blockDuration: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  routineTypes: z.array(z.string()),
});

const createBlockSchema = z.object({
  phaseId: z.string(),
  blockNumber: z.number(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  duration: z.number(),
  season: z.enum(["Pre-Season", "In-Season", "Off-Season", "Redshirt"]),
  subSeason: z.enum(["Early", "Mid", "Late", "General Off-Season (GOS)"]).optional(),
  status: z.enum(["draft", "active", "planned", "complete"]),
  currentDay: z.object({
    week: z.number(),
    day: z.number(),
  }).optional(),
  throwing: z.object({
    xRole: z.string(),
    phase: z.string(),
    exclusions: z.string().optional(),
  }).optional(),
  movement: z.object({
    intensity: z.string(),
    volume: z.string(),
  }).optional(),
  lifting: z.object({
    split: z.string(),
    emphasis: z.string(),
    variability: z.string(),
    scheme: z.string(),
  }).optional(),
  conditioning: z.object({
    coreEmphasis: z.string(),
    adaptation: z.string(),
    method: z.string(),
  }).optional(),
  lastModification: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Test endpoint to verify API is working
  app.get("/api/test-athletes", async (_req, res) => {
    res.json([{
      athlete: {
        id: "test-1",
        name: "Test Athlete",
        status: null,
      },
      blocks: [{
        id: "test-block-1",
        athleteId: "test-1",
        phaseId: "test-phase-1",
        blockNumber: 1,
        name: "Test Block",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 1,
        season: "Pre-Season" as const,
        status: "active" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
    }]);
  });

  // Get all athletes with blocks (new athlete-centric endpoint)
  app.get("/api/athletes", async (_req, res) => {
    try {
      console.log(`[API] /api/athletes - Request received`);
      console.log(`[API] Storage instance:`, storage ? 'exists' : 'null');
      const athletes = await storage.getAthletes();
      console.log(`[API] /api/athletes - Returning ${athletes.length} athletes`);
      if (athletes.length > 0) {
        console.log(`[API] First athlete ID: ${athletes[0].athlete.id}, Name: ${athletes[0].athlete.name}`);
        console.log(`[API] First athlete blocks count: ${athletes[0].blocks.length}`);
        console.log(`[API] First athlete structure:`, {
          hasAthlete: !!athletes[0].athlete,
          hasBlocks: !!athletes[0].blocks,
          athleteKeys: Object.keys(athletes[0]),
        });
      } else {
        console.log(`[API] WARNING: No athletes returned from storage!`);
      }
      res.json(athletes);
    } catch (error) {
      console.error("[API] Error fetching athletes:", error);
      if (error instanceof Error) {
        console.error("[API] Error stack:", error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to fetch athletes", details: errorMessage });
    }
  });

  // Get all programs (backward compatibility)
  app.get("/api/programs", async (_req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });

  // Create a new program
  app.post("/api/programs", async (req, res) => {
    try {
      const validatedData = insertProgramSchema.parse(req.body);
      const program = await storage.createProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create program" });
      }
    }
  });

  // Delete a program
  app.delete("/api/programs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProgram(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Program not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete program" });
    }
  });

  // Blocks API endpoints
  // GET /api/athletes/:athleteId/phases/:phaseId/blocks
  app.get("/api/athletes/:athleteId/phases/:phaseId/blocks", async (req, res) => {
    try {
      const { athleteId, phaseId } = req.params;
      const blocks = await storage.getBlocksByPhase(athleteId, phaseId);
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blocks" });
    }
  });

  // POST /api/athletes/:athleteId/phases/:phaseId/blocks
  app.post("/api/athletes/:athleteId/phases/:phaseId/blocks", async (req, res) => {
    try {
      const { athleteId, phaseId } = req.params;
      const validatedData = createBlockSchema.parse(req.body);
      const block = await storage.createBlock({
        ...validatedData,
        athleteId,
        phaseId,
      });
      res.status(201).json(block);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create block" });
      }
    }
  });

  // PUT /api/blocks/:blockId
  app.put("/api/blocks/:blockId", async (req, res) => {
    try {
      const { blockId } = req.params;
      const updates = req.body;
      const updatedBlock = await storage.updateBlock(blockId, updates);
      if (updatedBlock) {
        res.json(updatedBlock);
      } else {
        res.status(404).json({ error: "Block not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update block" });
    }
  });

  // DELETE /api/blocks/:blockId
  app.delete("/api/blocks/:blockId", async (req, res) => {
    try {
      const { blockId } = req.params;
      const deleted = await storage.deleteBlock(blockId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Block not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete block" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
