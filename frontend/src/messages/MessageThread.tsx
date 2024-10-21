import React, { useRef, useState, useEffect } from "react";
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
import { IoReturnDownBack } from "react-icons/io5";
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
  isViewingThread: boolean;
  isMobile: boolean | undefined;
  setIsViewingThread: (value: React.SetStateAction<boolean>) => void;
}

const MessageThread: React.FC<MessageProps> = ({
  messages,
  currentUserId,
  otherParticipantName,
  recipientId,
  isViewingThread,
  isMobile,
  setIsViewingThread,
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
      setMessageContent("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const messageRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the latest message when messages change
  useEffect(() => {
    messageRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

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
      {/* Conversation Title (Sticky) */}
      <Box
        position="sticky"
        top={0}
        bg="white"
        zIndex={1}
        p={1}
        borderBottom="1px solid lightgray"
        display={"flex"}
        alignItems={"center"}
      >
        {isViewingThread && isMobile && (
          <Button onClick={() => setIsViewingThread(false)} mx={2}>
            <Icon as={IoReturnDownBack} />
          </Button>
        )}
        <Text fontWeight={"medium"} fontSize={"large"} textAlign={"left"}>
          Conversation with {otherParticipantName}
        </Text>
      </Box>

      {/* Scrollable Message Container */}
      <Box
        flexGrow={1}
        overflowY="auto"
        p={4}
        ref={messageRef}
        maxHeight="calc(100vh - 200px)" // Adjust max height to ensure space for header and footer
      >
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

      {/* Message Input (Sticky) */}
      <Box
        position="sticky"
        bottom={0}
        bg="white"
        p={4}
        borderTop="1px solid lightgray"
        zIndex={1}
      >
        <form onSubmit={sendMessage}>
          <FormControl>
            <Box display={"flex"}>
              <Input
                placeholder="Type your message"
                borderRightRadius={0}
                borderLeftRadius={"15px"}
                value={messageContent}
                onChange={(event) =>
                  setMessageContent(event.currentTarget.value)
                }
              />
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
    </Box>
  );
};

export default MessageThread;
