import express from "express";
import { 
  getPosts, 
  createPost
} from "../controllers/postController.ts";
import { authenticateToken } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticateToken, getPosts);
router.post("/", authenticateToken, createPost);

export default router;
