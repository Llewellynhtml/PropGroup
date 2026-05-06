import express from "express";
import { getAgencySettings, updateAgencySettings } from "../controllers/agencyController.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticateToken, authorizeRoles("admin"), getAgencySettings);
router.put("/", authenticateToken, authorizeRoles("admin"), updateAgencySettings);

export default router;
