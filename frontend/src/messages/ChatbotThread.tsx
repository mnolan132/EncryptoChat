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

// Define the message structure type
interface Chatbot {
  id: string;
  messageContent: string;
  recipientId: string;
  senderId: string;
  timestamp: string;
}

interface ChatbotResponse {
  messages: Chatbot[];
}

interface ChatbotProps {
  currentUserId: string;
  isViewingThread: boolean;
  isMobile: boolean | undefined;
  setIsViewingThread: (value: React.SetStateAction<boolean>) => void;
  darkMode: boolean;
  messageData: ChatbotResponse | null; // Message data coming from Conversations component
}

const ChatbotConversation: React.FC<ChatbotProps> = ({
  currentUserId,
  isViewingThread,
  isMobile,
  setIsViewingThread,
  darkMode,
  messageData,
}) => {
  const [messageContent, setMessageContent] = useState("");
  const toast = useToast();
  const messageRef = useRef<HTMLDivElement | null>(null);

  // Send a new message to the chatbot
  const sendMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://encrypto-chat-theta.vercel.app/message/new-chatbot-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUserId,
            messageContent,
          }),
          // Optional: Use 'include' if you're using cookies or tokens
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setMessageContent("");
      toast({
        title: "Message sent",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Scroll to the latest message when messageData changes
  useEffect(() => {
    messageRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messageData]);

  // Handle empty messages
  if (
    !messageData ||
    !messageData.messages ||
    messageData.messages.length === 0
  ) {
    return <Text>No messages with ChatBot yet.</Text>;
  }

  return (
    <Box
      height={"100%"}
      display={"flex"}
      flexDir={"column"}
      justifyContent={"space-between"}
    >
      {/* Chatbot Title (Sticky) */}
      <Box
        position="sticky"
        top={0}
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
          Chat with ChatBot
        </Text>
      </Box>

      {/* Scrollable ChatBot Message Container */}
      <Box
        flexGrow={1}
        overflowY="auto"
        p={4}
        ref={messageRef}
        height="calc(100vh - 200px)"
      >
        {messageData.messages.map((msg) => {
          const isSentByCurrentUser = msg.senderId === currentUserId;

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
                <Text fontSize="xs" color="gray.500">
                  {formatTimestamp(msg.timestamp)}
                </Text>
                <Text textColor="gray.600">{msg.messageContent}</Text>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Message Input (Sticky) */}
      <Box
        position="sticky"
        bottom={0}
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

export default ChatbotConversation;
