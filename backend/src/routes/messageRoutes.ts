import { Router } from "express";
import { newMessage } from "../controllers/messageController";

const router = Router();

router.post("/new-message", newMessage);

export default router;
