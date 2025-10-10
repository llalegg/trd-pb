import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const insertProgramSchema = z.object({
  athleteId: z.string(),
  athleteName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  routineTypes: z.array(z.string()),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all programs
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

  const httpServer = createServer(app);

  return httpServer;
}
