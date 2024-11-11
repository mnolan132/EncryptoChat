import { Request, Response } from "express";
import dotenv from "dotenv";
import { db } from "../index";
import { getConversationId } from "../../utils";
import { Message } from "../../Message";
import crypto from "crypto";

const { OpenAI } = require("openai");

dotenv.config();

const openaiURL = "https://api.aimlapi.com/v1";
const apiKey = process.env.OPEN_API_KEY;
const systemPrompt =
  "You are a conversation assistant. Be descriptive and helpful";

const api = new OpenAI({
  apiKey,
  openaiURL,
});

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
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversationsRef = db.ref("conversations");
    const snapshot = await conversationsRef.once("value");

    if (!snapshot.exists()) {
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

    res.status(200).json({ messages: userMessages });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({ message: "Conversation ID is required" });
  }

  try {
    const conversationRef = db.ref(`conversations/${conversationId}`);

    const conversationSnapshot = await conversationRef.once("value");

    if (!conversationSnapshot.exists()) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Delete the conversation
    await conversationRef.remove();

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Failed to delete conversation" });
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

// Function to send a new message to the chatbot and get a response
export const newChatbotMessage = async (req: Request, res: Response) => {
  const { userId, messageContent } = req.body;

  if (!userId || !messageContent) {
    return res
      .status(400)
      .json({ message: "User ID and message content are required" });
  }

  try {
    // Send the user's message to the chatbot
    const completion = await api.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: messageContent,
        },
      ],
      temperature: 0.7,
      max_tokens: 256,
    });

    const chatbotResponse = completion.choices[0].message.content;

    // Prepare the message object to save both user and chatbot responses
    const timestamp = new Date().toISOString();
    const conversationId = `chatbot_${userId}`;

    // Store the user's message in the `chatbot_conversations` database location
    const userMessageRef = db
      .ref(`chatbot_conversations/${conversationId}/messages`)
      .push();
    await userMessageRef.set({
      senderId: userId,
      recipientId: "chatbot",
      messageContent,
      timestamp,
    });

    // Store the chatbot's response in the same location
    const chatbotMessageRef = db
      .ref(`chatbot_conversations/${conversationId}/messages`)
      .push();
    await chatbotMessageRef.set({
      senderId: "chatbot",
      recipientId: userId,
      messageContent: chatbotResponse,
      timestamp,
    });

    res.status(201).json({
      userMessage: messageContent,
      chatbotResponse,
    });
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    res.status(500).json({ message: "Failed to generate chatbot response" });
  }
};

// Function to retrieve all messages between the user and the chatbot
export const getChatbotMessages = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const conversationId = `chatbot_${userId}`;
    const messagesRef = db.ref(
      `chatbot_conversations/${conversationId}/messages`
    );
    const snapshot = await messagesRef.once("value");

    if (!snapshot.exists()) {
      return res
        .status(404)
        .json({ message: "No messages found with the chatbot" });
    }

    const messages = snapshot.val();
    const formattedMessages = Object.keys(messages).map((key) => ({
      id: key,
      ...messages[key],
    }));

    res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error retrieving chatbot messages:", error);
    res.status(500).json({ message: "Failed to retrieve chatbot messages" });
  }
};

export const sendWelcomeMessage = async (userId: string) => {
  if (!userId) {
    console.error("User ID is required for sending a welcome message.");
    return;
  }

  const welcomeMessageContent =
    "Welcome to Encrypto-Chat! I'm your friendly chatbot. How can I assist you today?";

  try {
    // Sending the welcome message to the chatbot model for further generation (optional)
    const completion = await api.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that welcomes users to the chat.",
        },
        {
          role: "user",
          content: welcomeMessageContent,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const chatbotResponse =
      completion.choices[0].message.content || welcomeMessageContent;

    // Prepare the message objects with timestamp
    const timestamp = new Date().toISOString();
    const conversationId = `chatbot_${userId}`;

    // Store the welcome message in the `chatbot_conversations` database location
    const chatbotMessageRef = db
      .ref(`chatbot_conversations/${conversationId}/messages`)
      .push();

    await chatbotMessageRef.set({
      senderId: "chatbot",
      recipientId: userId,
      messageContent: chatbotResponse,
      timestamp,
    });

    console.log("Welcome message sent to user:", userId);
  } catch (error) {
    console.error("Error sending welcome message:", error);
  }
};
