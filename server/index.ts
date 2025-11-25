import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";

const app = express();

// Export app for Vercel serverless function wrapper
export { app };
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

// Initialize the app and export it for Vercel
let initializedApp = app;
let initializedServer: any = null;

(async () => {
  const server = await registerRoutes(app);
  initializedServer = server;

  interface ErrorWithStatus extends Error {
    status?: number;
    statusCode?: number;
  }

  app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction): void => {
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    try {
      // Use absolute path import to prevent esbuild from analyzing/bundling
      // Import from dist folder at runtime to avoid bundling vite-setup module
      const viteSetupPath = path.resolve(import.meta.dirname, "vite-setup.js");
      const viteSetupModule = await import(/* @vite-ignore */ viteSetupPath);
      await viteSetupModule.setupVite(app, server);
    } catch (error) {
      // If Vite can't be loaded (e.g., in production or vite-setup not available), fall back to static serving
      console.warn("Failed to load Vite, falling back to static serving:", error);
      serveStatic(app);
    }
  } else {
    serveStatic(app);
  }

  // Only start the server if not running on Vercel
  // Vercel will use the serverless function wrapper in api/index.js
  if (!process.env.VERCEL) {
    const port = parseInt(process.env.PORT || '3000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } else {
    // On Vercel, export the app for serverless function wrapper
    log("Running on Vercel - app exported for serverless function");
  }
})();

// Export app for Vercel serverless function wrapper
export { app };
