import express from "express";
import { 
  getBranding, 
  createBranding, 
  updateBranding, 
  deleteBranding 
} from "../controllers/brandingController.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticateToken, getBranding);
router.post("/", authenticateToken, authorizeRoles('admin'), createBranding);
router.put("/:id", authenticateToken, authorizeRoles('admin', 'manager'), updateBranding);
router.delete("/:id", authenticateToken, authorizeRoles('admin'), deleteBranding);

export default router;
