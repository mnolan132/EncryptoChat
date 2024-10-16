import React, { useState } from "react";
import {
  Box,
  Button,
  Icon,
  Input,
  Text,
  FormControl,
  useToast,
} from "@chakra-ui/react";
import { BsFillSendFill } from "react-icons/bs";
import { formatTimestamp } from "../utils";

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
  otherParticipantName: string;
  recipientId: string;
}

const MessageThread: React.FC<MessageProps> = ({
  messages,
  currentUserId,
  otherParticipantName,
  recipientId,
}) => {
  const [messageContent, setMessageContent] = useState("");
  const toast = useToast();

  const sendMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5001/message/new-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: currentUserId,
            recipientId,
            messageContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      toast({
        title: "Message sent",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
      console.log(data);
      setMessageContent("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle undefined or null messages
  if (!messages || messages.length === 0) {
    return <Text>No messages in this conversation.</Text>;
  }

  return (
    <Box
      height={"100%"}
      display={"flex"}
      flexDir={"column"}
      justifyContent={"space-between"}
    >
      <Text fontWeight={"medium"} fontSize={"large"} textAlign={"left"}>
        Conversation with {otherParticipantName}
      </Text>

      <Box p={4} overflowY="scroll" flexGrow={1}>
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
      <form onSubmit={sendMessage}>
        <FormControl>
          <Box display={"flex"} my="10px">
            <Input
              placeholder="Type your message"
              borderRightRadius={0}
              borderLeftRadius={"15px"}
              value={messageContent}
              onChange={(event) => setMessageContent(event.currentTarget.value)}
            ></Input>
            <Button
              borderLeftRadius={0}
              borderRightRadius={"15px"}
              colorScheme="teal"
              bgColor={"#0CCEC2"}
              type={"submit"}
            >
              <Icon as={BsFillSendFill} />
            </Button>
          </Box>
        </FormControl>
      </form>
    </Box>
  );
};

export default MessageThread;
