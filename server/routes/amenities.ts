import express from "express";
import { 
  getAmenities, 
  createAmenity, 
  deleteAmenity 
} from "../controllers/amenityController.ts";
import { authenticateToken, authorizeRoles } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticateToken, getAmenities);
router.post("/", authenticateToken, authorizeRoles('admin', 'manager'), createAmenity);
router.delete("/:id", authenticateToken, authorizeRoles('admin'), deleteAmenity);

export default router;
