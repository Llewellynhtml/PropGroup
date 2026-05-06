import express from "express";
import { commentController } from "../controllers/commentController.ts";
import { authenticateToken } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticateToken, commentController.getComments);
router.post("/", authenticateToken, commentController.createComment);
router.delete("/:id", authenticateToken, commentController.deleteComment);

export default router;
