import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Initialize routes and setup static serving
let appInitialized = false;

async function initializeApp() {
  if (appInitialized) return;
  
  // Register routes (server return value not needed for Vercel serverless)
  await registerRoutes(app);

  interface ErrorWithStatus extends Error {
    status?: number;
    statusCode?: number;
  }

  app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction): void => {
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // In production (Vercel), serve static files
  // Note: serveStatic looks for dist/public relative to server/vite.ts
  // In Vercel, the build output is in dist/public relative to project root
  try {
    serveStatic(app);
  } catch (error) {
    // If static files aren't found, that's okay - Vercel will handle static assets
    console.warn("Static files not found, Vercel will serve them:", error);
  }
  
  appInitialized = true;
}

// Initialize app on first request
app.use(async (req, res, next) => {
  await initializeApp();
  next();
});

// Export the Express app for Vercel
export default app;

