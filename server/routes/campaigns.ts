import express from "express";
import { generateCampaign, getCampaigns } from "../controllers/campaignController.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.ts";

const router = express.Router();

router.post("/generate", authenticateToken, authorizeRoles('admin', 'manager', 'agent'), generateCampaign);
router.get("/", authenticateToken, getCampaigns);

export default router;
