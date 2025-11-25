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
      console.log(`[API] Environment check:`, {
        USE_DATABASE: process.env.USE_DATABASE,
        hasDatabaseUrl: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING),
        NODE_ENV: process.env.NODE_ENV,
      });
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
        console.log(`[API] This might indicate:`);
        console.log(`[API] 1. Database is empty (run populate script)`);
        console.log(`[API] 2. Database connection failed (check POSTGRES_URL)`);
        console.log(`[API] 3. USE_DATABASE not set, but MemStorage seed data failed`);
      }
      // Always return an array, even if empty
      res.json(athletes || []);
    } catch (error) {
      console.error("[API] Error fetching athletes:", error);
      if (error instanceof Error) {
        console.error("[API] Error stack:", error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      // Return empty array instead of error to prevent frontend crashes
      console.error("[API] Returning empty array due to error");
      res.status(200).json([]);
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

  // GET /api/athletes/:athleteId/today-session
  app.get("/api/athletes/:athleteId/today-session", async (req, res) => {
    try {
      const { athleteId } = req.params;
      const athletes = await storage.getAthletes();
      const athleteData = athletes.find(a => a.athlete.id === athleteId);
      
      if (!athleteData) {
        return res.status(404).json({ error: "Athlete not found" });
      }

      // Find active block
      const activeBlock = athleteData.blocks.find(b => b.status === "active");
      if (!activeBlock) {
        return res.json({ throwing: null, lifting: null });
      }

      // Get today's session data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Determine intensity based on block configuration
      const throwingIntensity = activeBlock.throwing ? "High" : null;
      const liftingIntensity = activeBlock.lifting?.emphasis === "Strength" || activeBlock.lifting?.emphasis === "Power" 
        ? "Heavy" 
        : activeBlock.lifting?.emphasis === "Recovery" || activeBlock.lifting?.emphasis === "Restorative"
        ? "Light"
        : "Moderate";

      res.json({
        throwing: throwingIntensity ? {
          type: "Throwing",
          intensity: throwingIntensity,
        } : null,
        lifting: activeBlock.lifting ? {
          type: "Lifting",
          intensity: liftingIntensity,
        } : null,
      });
    } catch (error) {
      console.error("[API] Error fetching today's session:", error);
      res.status(500).json({ error: "Failed to fetch today's session" });
    }
  });

  // Collaborator endpoints
  // GET /api/athletes/:athleteId/collaborators
  app.get("/api/athletes/:athleteId/collaborators", async (req, res) => {
    try {
      const { athleteId } = req.params;
      const collaborators = await storage.getCollaborators(athleteId);
      res.json(collaborators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collaborators" });
    }
  });

  // POST /api/athletes/:athleteId/collaborators
  app.post("/api/athletes/:athleteId/collaborators", async (req, res) => {
    try {
      const { athleteId } = req.params;
      const { userId, permissionLevel } = req.body;
      if (!userId || !permissionLevel) {
        return res.status(400).json({ error: "userId and permissionLevel are required" });
      }
      const collaborator = await storage.addCollaborator(athleteId, userId, permissionLevel);
      res.status(201).json(collaborator);
    } catch (error) {
      res.status(500).json({ error: "Failed to add collaborator" });
    }
  });

  // DELETE /api/collaborators/:collaboratorId
  app.delete("/api/collaborators/:collaboratorId", async (req, res) => {
    try {
      const { collaboratorId } = req.params;
      const deleted = await storage.removeCollaborator(collaboratorId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Collaborator not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to remove collaborator" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
