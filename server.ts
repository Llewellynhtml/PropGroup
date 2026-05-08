import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log(`Starting server in ${process.env.NODE_ENV || "development"} mode`);

  const app = express();

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

  // Load SQLite routes — non-fatal if better-sqlite3 unavailable on Render
  try {
    const { default: authRoutes }      = await import("./server/routes/auth.ts");
    const { default: propertyRoutes }  = await import("./server/routes/properties.ts");
    const { default: agentRoutes }     = await import("./server/routes/agents.ts");
    const { default: amenityRoutes }   = await import("./server/routes/amenities.ts");
    const { default: brandingRoutes }  = await import("./server/routes/branding.ts");
    const { default: templateRoutes }  = await import("./server/routes/templates.ts");
    const { default: historyRoutes }   = await import("./server/routes/history.ts");
    const { default: postRoutes }      = await import("./server/routes/posts.ts");
    const { default: scheduleRoutes }  = await import("./server/routes/schedules.ts");
    const { default: uploadRoutes }    = await import("./server/routes/uploads.ts");
    const { default: leadRoutes }      = await import("./server/routes/leads.ts");
    const { default: analyticsRoutes } = await import("./server/routes/analytics.ts");
    const { default: agencyRoutes }    = await import("./server/routes/agencies.ts");
    const { default: campaignRoutes }  = await import("./server/routes/campaigns.ts");
    const { default: commentRoutes }   = await import("./server/routes/comments.ts");

    const { initDb } = await import("./server/config/db.ts");
    try { initDb(); console.log("Database initialized"); }
    catch (e) { console.error("DB init failed:", e); }

    const { initPostWorker } = await import("./server/workers/postWorker.ts");
    try { initPostWorker(); console.log("Post worker initialized"); }
    catch (e) { console.error("Post worker failed:", e); }

    app.use("/api/auth",            authRoutes);
    app.use("/api/properties",      propertyRoutes);
    app.use("/api/agents",          agentRoutes);
    app.use("/api/amenities",       amenityRoutes);
    app.use("/api/branding",        brandingRoutes);
    app.use("/api/templates",       templateRoutes);
    app.use("/api/history",         historyRoutes);
    app.use("/api/posts",           postRoutes);
    app.use("/api/scheduled_posts", scheduleRoutes);
    app.use("/api/leads",           leadRoutes);
    app.use("/api/analytics",       analyticsRoutes);
    app.use("/api/agencies",        agencyRoutes);
    app.use("/api/campaigns",       campaignRoutes);
    app.use("/api/comments",        commentRoutes);
    app.use("/api",                 uploadRoutes);
    console.log("All API routes mounted.");
  } catch (e) {
    console.error("API routes unavailable (native module issue):", e);
    console.warn("Serving frontend only — Supabase handles all auth/data.");
  }

  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  // Always serve the built dist folder
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Fatal server error:", e);
  process.exit(1);
});
