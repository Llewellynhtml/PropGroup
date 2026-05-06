import express from "express";
import { leadController } from "../controllers/leadController.ts";
import { authenticateToken } from "../middleware/auth.ts";

const router = express.Router();

// Public endpoint for creating leads (e.g. from website or social media)
router.post("/", authenticateToken, leadController.createLead);

// Protected endpoints for managing leads
router.get("/", authenticateToken, leadController.getLeads);
router.get("/:id", authenticateToken, leadController.getLeadById);
router.patch("/:id", authenticateToken, leadController.updateLead);
router.post("/:id/notes", authenticateToken, leadController.addNote);
router.post("/:id/tasks", authenticateToken, leadController.addTask);
router.patch("/:id/tasks/:taskId", authenticateToken, leadController.toggleTask);

export default router;
