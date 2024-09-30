import { Request, Response } from "express";
import { db } from "../index";
import { getUserIdFromEmail } from "../../utils";
import { Message } from "../../Message";

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

//all messages need a: sender, recipient, message body and timestamp
