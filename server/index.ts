import express from "express";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
dotenv.config();

(async () => {
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

  // Register API routes
  const httpServer = await registerRoutes(app);

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    app.use(serveStatic());
  } else {
    // Setup Vite dev server in development
    await setupVite(app);
  }

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
