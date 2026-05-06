import express from "express";
import { 
  getHistory, 
  createHistory, 
  deleteHistoryItem, 
  clearHistory 
} from "../controllers/historyController.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticateToken, getHistory);
router.post("/", authenticateToken, createHistory);
router.delete("/:id", authenticateToken, authorizeRoles('admin', 'manager'), deleteHistoryItem);
router.delete("/", authenticateToken, authorizeRoles('admin'), clearHistory);

export default router;
