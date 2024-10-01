import { Router } from "express";
import { newMessage, getMessages } from "../controllers/messageController";

const router = Router();

router.post("/new-message", newMessage);
router.get("/get-messages/:email", getMessages);

export default router;
