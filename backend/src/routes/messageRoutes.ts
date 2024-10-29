import { Router } from "express";
import {
  newMessage,
  getMessages,
  deleteUserMessages,
} from "../controllers/messageController";

const router = Router();

router.post("/new-message", newMessage);
router.get("/get-messages/:userId", getMessages);
router.delete("/messages/:userId", deleteUserMessages);

export default router;
