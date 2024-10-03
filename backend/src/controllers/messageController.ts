import { Request, Response } from "express";
import { db } from "../index";
import { getUserIdFromEmail } from "../../utils";
import { Message } from "../../Message";

// Assuming this is your message structure
interface ChatMessage {
  senderId: string;
  recipientId: string;
  messageContent: string;
  timestamp: string;
}

export const newMessage = async (req: Request, res: Response) => {
  const { senderId, recipientEmail, messageContent } = req.body;

  if (!senderId || !recipientEmail || !messageContent) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const timestamp = new Date().toISOString(); // Use ISO string format for consistent timestamp

  try {
    const recipientId = await getUserIdFromEmail(recipientEmail);

    if (!recipientId) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const message = new Message(
      senderId,
      recipientId,
      messageContent,
      timestamp
    );

    // Example: Save the message to Firebase Realtime Database
    const messageRef = db.ref(`messages`).push();
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
    // Get the userId for the specified email
    const userId = await getUserIdFromEmail(email);

    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch messages where the user is either the sender or recipient
    const messagesRef = db.ref("messages");
    const snapshot = await messagesRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No messages found" });
    }

    const allMessages = snapshot.val() as Record<string, ChatMessage>;
    console.log("All messages:", allMessages);

    const userMessages = Object.entries(allMessages)
      .filter(
        ([_, message]) =>
          message.senderId === userId || message.recipientId === userId
      )
      .map(([key, message]) => ({ id: key, ...message }));

    console.log("Filtered messages for user:", userMessages);

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
