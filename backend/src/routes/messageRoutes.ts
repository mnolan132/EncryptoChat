import { Router } from "express";
import {
  newMessage,
  getMessages,
  deleteUserMessages,
  deleteConversation,
  newChatbotMessage,
  getChatbotMessages,
} from "../controllers/messageController";

const router = Router();

router.post("/new-message", newMessage);
router.get("/get-messages/:userId", getMessages);
router.delete("/messages/:userId", deleteUserMessages);
router.delete("/conversation/:conversationId", deleteConversation);
router.post("/new-chatbot-message", newChatbotMessage);
router.get("/get-chatbot-messages/:userId", getChatbotMessages);

export default router;
