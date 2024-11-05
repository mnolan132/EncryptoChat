import { Router } from "express";
import {
  newMessage,
  getMessages,
  deleteUserMessages,
  deleteConversation,
} from "../controllers/messageController";

const router = Router();

router.post("/new-message", newMessage);
router.get("/get-messages/:userId", getMessages);
router.delete("/messages/:userId", deleteUserMessages);
router.delete("/conversation/:conversationId", deleteConversation);

export default router;
