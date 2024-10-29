import { Request, Response } from "express";
import { db } from "../index";
import { getConversationId } from "../../utils";
import { Message } from "../../Message";
import crypto from "crypto";

// Define the ChatMessage interface if it's not defined elsewhere
interface ChatMessage {
  senderId: string;
  recipientId: string;
  messageContent: string; // Encrypted message content in the database
  timestamp: string;
}

export const newMessage = async (req: Request, res: Response) => {
  const { senderId, recipientId, messageContent } = req.body;

  if (!senderId || !recipientId || !messageContent) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const timestamp = new Date().toISOString();

  try {
    const conversationId = getConversationId(senderId, recipientId);

    // Retrieve recipient's public key from the database
    const recipientRef = db.ref(`users/${recipientId}/publicKey`);
    const recipientPublicKeySnapshot = await recipientRef.once("value");
    const recipientPublicKey = recipientPublicKeySnapshot.val();

    // Log recipient ID and public key
    console.log(`Recipient ID: ${recipientId}`);
    console.log(`Recipient Public Key: ${recipientPublicKey}`);

    if (!recipientPublicKey) {
      return res
        .status(404)
        .json({ message: "Recipient public key not found" });
    }

    // Encrypt the message content with the recipient's public key
    const encryptedMessage = crypto
      .publicEncrypt(
        {
          key: recipientPublicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256", // Specify the hash algorithm
        },
        Buffer.from(messageContent)
      )
      .toString("base64");

    // Create the encrypted message object
    const message = new Message(
      senderId,
      recipientId,
      encryptedMessage,
      timestamp
    );

    // Save the encrypted message
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
  const { userId } = req.params;

  try {
    console.log("Starting to retrieve messages for user:", userId);

    if (!userId) {
      console.warn("User ID is missing.");
      return res.status(404).json({ message: "User not found" });
    }

    const conversationsRef = db.ref("conversations");
    const snapshot = await conversationsRef.once("value");

    if (!snapshot.exists()) {
      console.warn("No conversations found in the database.");
      return res.status(404).json({ message: "No conversations found" });
    }

    const allConversations = snapshot.val();
    const userConversations = Object.keys(allConversations).filter(
      (conversationId) => {
        const messages = allConversations[conversationId].messages as {
          [key: string]: ChatMessage;
        };
        return Object.values(messages).some(
          (message) =>
            message.senderId === userId || message.recipientId === userId
        );
      }
    );

    console.log("Filtered conversations for user:", userConversations);

    const userMessages: Array<{
      id: string;
      conversationId: string;
      message: ChatMessage;
    }> = [];

    for (const conversationId of userConversations) {
      const messages = allConversations[conversationId].messages as {
        [key: string]: ChatMessage;
      };

      for (const messageId in messages) {
        const message = messages[messageId];

        // Check if the user is part of the conversation (sender or recipient)
        if (message.senderId === userId || message.recipientId === userId) {
          console.log(`Found message for user ${userId}:`, message);

          const recipientRef = db.ref(
            `users/${message.recipientId}/privateKey`
          );
          const recipientPrivateKeySnapshot = await recipientRef.once("value");
          const recipientPrivateKey = recipientPrivateKeySnapshot.val();

          if (!message.messageContent) {
            console.warn(
              `Message content is missing for message ID ${messageId}`
            );
            continue; // Skip messages without content
          }

          try {
            // Decrypt the message content
            const decryptedMessage = crypto
              .privateDecrypt(
                {
                  key: recipientPrivateKey,
                  passphrase: "", // Add passphrase if used during key generation
                  padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                  oaepHash: "sha256", // Ensure this matches encryption
                },
                Buffer.from(message.messageContent, "base64")
              )
              .toString("utf-8");

            // Add decrypted message to the response array
            userMessages.push({
              id: messageId,
              conversationId,
              message: {
                ...message,
                messageContent: decryptedMessage,
              },
            });
          } catch (decryptError) {
            console.error(
              `Decryption failed for message ID ${messageId}:`,
              decryptError
            );
            continue; // Skip to the next message
          }
        }
      }
    }

    if (userMessages.length === 0) {
      console.warn(`No messages found for user ${userId}`);
      return res
        .status(404)
        .json({ message: "No messages found for this user" });
    }

    console.log("Successfully retrieved messages:", userMessages);
    res.status(200).json({ messages: userMessages });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};

export const deleteUserMessages = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const conversationsRef = db.ref("conversations");
    const snapshot = await conversationsRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No conversations found" });
    }

    const allConversations = snapshot.val();

    for (const conversationId in allConversations) {
      const messages = allConversations[conversationId].messages;

      for (const messageId in messages) {
        const message = messages[messageId];

        // Check if the user is the sender or recipient of the message
        if (message.senderId === userId || message.recipientId === userId) {
          // Delete the message if it matches the user ID
          await conversationsRef
            .child(`${conversationId}/messages/${messageId}`)
            .remove();
        }
      }
    }

    res.status(200).json({ message: "All user messages deleted successfully" });
  } catch (error) {
    console.error("Error deleting user messages:", error);
    res.status(500).json({ message: "Failed to delete user messages" });
  }
};
