import express from "express";
import { 
  getTemplates, 
  toggleFavoriteTemplate, 
  updateTemplate 
} from "../controllers/templateController.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticateToken, getTemplates);
router.post("/:id/toggle-favorite", authenticateToken, authorizeRoles('admin', 'manager'), toggleFavoriteTemplate);
router.put("/:id", authenticateToken, authorizeRoles('admin'), updateTemplate);

export default router;
