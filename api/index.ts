import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { log } from "../server/vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

      log(logLine);
    }
  });

  next();
});

// Initialize routes
let appInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeApp() {
  if (appInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Register routes - ignore the Server return value as we don't need it in serverless
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

    appInitialized = true;
  })();

  return initPromise;
}

// Vercel serverless function handler
export default async function handler(req: Request, res: Response) {
  await initializeApp();
  // Vercel will handle the Express app directly
  app(req, res);
}

