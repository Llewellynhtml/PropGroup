import express from "express";
import { 
  uploadFile, 
  uploadPostMedia 
} from "../controllers/uploadController.ts";
import { authenticateToken } from "../middleware/auth.ts";
import { upload } from "../middleware/upload.ts";

const router = express.Router();

router.post("/upload", authenticateToken, upload.single("image"), uploadFile);
router.post("/posts/media", authenticateToken, upload.single("media"), uploadPostMedia);

export default router;
