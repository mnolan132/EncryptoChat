import React from "react";
import { Box, Text } from "@chakra-ui/react";

// Define the message structure types
type Message = {
  messageContent: string;
  recipientId: string;
  senderId: string;
  timestamp: string;
};

type MessageData = {
  id: string;
  conversationId: string;
  message: Message;
};

interface MessageProps {
  messages: MessageData[] | null | undefined; // Accept null and undefined
  currentUserId: string; // Pass the current user to differentiate sent and received messages
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

const MessageThread: React.FC<MessageProps> = ({ messages, currentUserId }) => {
  // Handle undefined or null messages
  if (!messages || messages.length === 0) {
    return <Text>No messages in this conversation.</Text>;
  }

  return (
    <Box p={4} overflowY="scroll" maxHeight="600px">
      {messages.map((msg) => {
        const isSentByCurrentUser = msg.message.senderId === currentUserId;

        return (
          <Box
            key={msg.id}
            display="flex"
            justifyContent={isSentByCurrentUser ? "flex-end" : "flex-start"}
            mb={4}
          >
            <Box
              bg={isSentByCurrentUser ? "blue.200" : "gray.200"}
              borderRadius="lg"
              p={3}
              maxWidth="60%"
              textAlign={"left"}
            >
              <Text fontSize="sm" mb={1} color="gray.600">
                {formatTimestamp(msg.message.timestamp)}
              </Text>
              <Text>{msg.message.messageContent}</Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default MessageThread;
