import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
let initDb: () => void = () => {};
let initPostWorker: () => void = () => {};
try {
  const dbModule = await import("./server/config/db.ts");
  initDb = dbModule.initDb;
  const workerModule = await import("./server/workers/postWorker.ts");
  initPostWorker = workerModule.initPostWorker;
} catch (e) {
  console.error("Could not load DB/worker modules (native deps may be missing):", e);
}

// Routes loaded dynamically to prevent native module crashes
let authRoutes: any, propertyRoutes: any, agentRoutes: any, amenityRoutes: any;
let brandingRoutes: any, templateRoutes: any, historyRoutes: any, postRoutes: any;
let scheduleRoutes: any, uploadRoutes: any, leadRoutes: any, analyticsRoutes: any;
let agencyRoutes: any, campaignRoutes: any, commentRoutes: any;
let routesLoaded = false;

async function loadRoutes() {
  try {
    authRoutes     = (await import("./server/routes/auth.ts")).default;
    propertyRoutes = (await import("./server/routes/properties.ts")).default;
    agentRoutes    = (await import("./server/routes/agents.ts")).default;
    amenityRoutes  = (await import("./server/routes/amenities.ts")).default;
    brandingRoutes = (await import("./server/routes/branding.ts")).default;
    templateRoutes = (await import("./server/routes/templates.ts")).default;
    historyRoutes  = (await import("./server/routes/history.ts")).default;
    postRoutes     = (await import("./server/routes/posts.ts")).default;
    scheduleRoutes = (await import("./server/routes/schedules.ts")).default;
    uploadRoutes   = (await import("./server/routes/uploads.ts")).default;
    leadRoutes     = (await import("./server/routes/leads.ts")).default;
    analyticsRoutes= (await import("./server/routes/analytics.ts")).default;
    agencyRoutes   = (await import("./server/routes/agencies.ts")).default;
    campaignRoutes = (await import("./server/routes/campaigns.ts")).default;
    commentRoutes  = (await import("./server/routes/comments.ts")).default;
    routesLoaded = true;
    console.log("All routes loaded successfully");
  } catch (e) {
    console.error("Could not load routes (native deps missing):", e);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
try {
  initDb();
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Failed to initialize database (non-fatal):", error);
  console.warn("Server will continue without local DB — Supabase handles auth/data.");
}

// Initialize Post Worker
try {
  initPostWorker();
  console.log("Post publishing worker initialized");
} catch (error) {
  console.error("Failed to initialize post worker (non-fatal):", error);
}

async function startServer() {
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  // Load routes (may fail if native deps missing — app still serves frontend)
  await loadRoutes();

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

  // API Routes — only mount if routes loaded successfully
  if (routesLoaded) {
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
  } else {
    console.warn("API routes not mounted — SQLite unavailable. Frontend still served via Supabase.");
  }

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

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
