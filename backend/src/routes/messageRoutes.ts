import { Router } from "express";
import { newMessage, getMessages } from "../controllers/messageController";

const router = Router();

router.post("/new-message", newMessage);
router.get("/get-messages/:userId", getMessages);

export default router;
