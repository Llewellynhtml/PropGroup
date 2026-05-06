import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./server/config/db.ts";
import { initPostWorker } from "./server/workers/postWorker.ts";

// Import Routes
import authRoutes from "./server/routes/auth.ts";
import propertyRoutes from "./server/routes/properties.ts";
import agentRoutes from "./server/routes/agents.ts";
import amenityRoutes from "./server/routes/amenities.ts";
import brandingRoutes from "./server/routes/branding.ts";
import templateRoutes from "./server/routes/templates.ts";
import historyRoutes from "./server/routes/history.ts";
import postRoutes from "./server/routes/posts.ts";
import scheduleRoutes from "./server/routes/schedules.ts";
import uploadRoutes from "./server/routes/uploads.ts";
import leadRoutes from "./server/routes/leads.ts";
import analyticsRoutes from "./server/routes/analytics.ts";
import agencyRoutes from "./server/routes/agencies.ts";
import campaignRoutes from "./server/routes/campaigns.ts";
import commentRoutes from "./server/routes/comments.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
try {
  initDb();
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Failed to initialize database:", error);
}

// Initialize Post Worker
try {
  initPostWorker();
  console.log("Post publishing worker initialized");
} catch (error) {
  console.error("Failed to initialize post worker:", error);
}

async function startServer() {
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);
  const app = express();
  
  // Request Logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // Static Files
  app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
  app.use("/uploads/posts", express.static(path.join(__dirname, "public/uploads/posts")));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/properties", propertyRoutes);
  app.use("/api/agents", agentRoutes);
  app.use("/api/amenities", amenityRoutes);
  app.use("/api/branding", brandingRoutes);
  app.use("/api/templates", templateRoutes);
  app.use("/api/history", historyRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/scheduled_posts", scheduleRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/agencies", agencyRoutes);
  app.use("/api/campaigns", campaignRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api", uploadRoutes);

  // 404 for unmatched API routes
  app.all("/api/*", (req, res) => {
    console.warn(`[404] Unmatched API route: ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: "API route not found", 
      method: req.method, 
      url: req.url 
    });
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
