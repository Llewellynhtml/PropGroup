import express from "express";
import { 
  getAgents, 
  createAgent, 
  updateAgent, 
  deleteAgent 
} from "../controllers/agentController.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticateToken, getAgents);
router.post("/", authenticateToken, authorizeRoles('admin'), createAgent);
router.put("/:id", authenticateToken, authorizeRoles('admin', 'manager'), updateAgent);
router.delete("/:id", authenticateToken, authorizeRoles('admin'), deleteAgent);

export default router;
