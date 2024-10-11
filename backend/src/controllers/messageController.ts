import { Request, Response } from "express";
import { db } from "../index";
import { getUserIdFromEmail, getConversationId } from "../../utils";
import { Message } from "../../Message";

// Assuming this is your message structure
interface ChatMessage {
  senderId: string;
  recipientId: string;
  messageContent: string;
  timestamp: string;
}

export const newMessage = async (req: Request, res: Response) => {
  const { senderId, recipientId, messageContent } = req.body;

  if (!senderId || !recipientId || !messageContent) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const timestamp = new Date().toISOString(); // Use ISO string format for consistent timestamp

  try {
    const conversationId = getConversationId(senderId, recipientId);

    const message = new Message(
      senderId,
      recipientId,
      messageContent,
      timestamp
    );

    // Save the message to the conversation thread
    const messageRef = db
      .ref(`conversations/${conversationId}/messages`)
      .push();
    await messageRef.set(message);

    res.status(201).json({
      message: "Message sent successfully",
      messageId: messageRef.key,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { email } = req.params;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Valid user email is required" });
  }

  try {
    const userId = await getUserIdFromEmail(email);

    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all conversations
    const conversationsRef = db.ref("conversations");
    const snapshot = await conversationsRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No conversations found" });
    }

    const allConversations = snapshot.val();
    const userMessages: Array<{
      id: string;
      conversationId: string;
      message: ChatMessage;
    }> = [];

    // Iterate over each conversation
    for (const conversationId in allConversations) {
      const messages = allConversations[conversationId].messages;

      for (const messageId in messages) {
        const message = messages[messageId] as ChatMessage;

        // Check if the user is part of the conversation (sender or recipient)
        if (message.senderId === userId || message.recipientId === userId) {
          userMessages.push({ id: messageId, conversationId, message });
        }
      }
    }

    if (userMessages.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found for this user" });
    }

    res.status(200).json({ messages: userMessages });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};
