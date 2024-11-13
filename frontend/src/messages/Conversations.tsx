import {
  Box,
  Button,
  Icon,
  Text,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiMessageEdit } from "react-icons/bi";
import MessageThread from "./MessageThread";
import NewMessage from "./NewMessage";
import { formatTimestamp } from "../utils";
import axios from "axios";
import UserThumbnail from "../utiltyComponent/UserThumbnail";
import { MdDeleteForever } from "react-icons/md";
import ChatbotThread from "./ChatbotThread";

// Define the message structure types
type Message = {
  messageContent: string;
  recipientId: string;
  senderId: string;
  timestamp: string;
};

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

type MessageData = {
  id: string;
  conversationId: string;
  message: Message;
};

type MessagesResponse = {
  messages: MessageData[];
};

type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
};

interface MessagesProps {
  user: null | User;
  darkMode: boolean;
}

interface Contact {
  id: string;
  firstName: string;
  email: string;
  lastName: string;
}

const Conversations: React.FC<MessagesProps> = ({ user, darkMode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [messagesData, setMessagesData] = useState<MessagesResponse | null>(
    null
  );
  const [chatbotData, setChatbotData] = useState<ChatbotResponse | null>(null);
  const [conversationNames, setConversationNames] = useState<
    Record<string, string>
  >({});
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [isViewingThread, setIsViewingThread] = useState(false);

  // Check if user is on mobile
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Function to fetch messages from the database
  const fetchMessages = async (): Promise<MessagesResponse | null> => {
    try {
      const response = await fetch(
        `https://encrypto-chat-theta.vercel.app/message/get-messages/${user?.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching messages:", error);
      return null;
    }
  };

  const fetchChatbotMessage = async (): Promise<ChatbotResponse | null> => {
    try {
      const response = await fetch(
        `https://encrypto-chat-theta.vercel.app/message/get-chatbot-messages/${user?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check for CORS preflight response
      if (response.status === 204) {
        console.warn("CORS Preflight passed, but no content received.");
        return null;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return null;
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get(
        `https://encrypto-chat-theta.vercel.app/contacts/getContacts/${user?.id}`
      );
      setContacts(response.data.contacts);
    } catch (error) {
      console.error("Error fetching contacts", error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // Make the delete request
      await axios.delete(
        `https://encrypto-chat-theta.vercel.app/message/conversation/${conversationId}`
      );

      checkForNewMessages();

      // Reset selectedConversation if it was deleted

      setSelectedConversation(null);
      setIsViewingThread(false);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Function to check if new messages have been received
  const checkForNewMessages = async () => {
    const newMessagesData = await fetchMessages();
    const newChatbotData = await fetchChatbotMessage();
    if (newMessagesData && newMessagesData.messages.length > 0) {
      if (
        !messagesData ||
        newMessagesData.messages.length !== messagesData.messages.length
      ) {
        setMessagesData(newMessagesData);
        await fetchUserNames(newMessagesData);
        // setDefaultConversation(newMessagesData);
      }
    }
    if (newChatbotData && newChatbotData.messages.length > 0) {
      if (
        !chatbotData ||
        newChatbotData.messages.length !== chatbotData.messages.length
      ) {
        setChatbotData(newChatbotData);
      }
    }
  };

  const fetchUserNames = async (data: MessagesResponse) => {
    const conversations: Record<string, string> = {};
    const conversationParticipants = Array.from(
      new Set(
        data.messages.map((msg) =>
          user && user.id !== msg.message.senderId
            ? msg.message.senderId
            : msg.message.recipientId
        )
      )
    );

    await Promise.all(
      conversationParticipants.map(async (participantId) => {
        try {
          const response = await fetch(
            `https://encrypto-chat-theta.vercel.app/user/${participantId}`
          );
          if (response.ok) {
            const otherUser: User = await response.json();
            conversations[
              participantId
            ] = `${otherUser.firstName} ${otherUser.lastName}`;
          }
        } catch (error) {
          console.error(`Error fetching user ${participantId}:`, error);
        }
      })
    );
    setConversationNames(conversations);
  };

  const setDefaultConversation = (data: MessagesResponse) => {
    if (!data || data.messages.length === 0) return;
    const sortedMessages = [...data.messages].sort(
      (a, b) =>
        new Date(b.message.timestamp).getTime() -
        new Date(a.message.timestamp).getTime()
    );
    setSelectedConversation(sortedMessages[0].conversationId);
  };

  useEffect(() => {
    if (user && user.id) {
      checkForNewMessages();
      fetchContacts();
      console.log("contacts: ", contacts);
      const intervalId = setInterval(() => checkForNewMessages(), 3000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const uniqueConversations = messagesData
    ? Array.from(
        new Set(messagesData.messages.map((msg) => msg.conversationId))
      )
    : [];

  const getLatestMessage = (conversationId: string) => {
    if (!messagesData) return null;
    const conversationMessages = messagesData.messages.filter(
      (msg) => msg.conversationId === conversationId
    );
    if (conversationMessages.length === 0) return null;
    return conversationMessages.reduce((latest, current) =>
      new Date(latest.message.timestamp) > new Date(current.message.timestamp)
        ? latest
        : current
    );
  };

  const getConversationMessages = (conversationId: string) => {
    return messagesData?.messages.filter(
      (msg) => msg.conversationId === conversationId
    );
  };

  const getChatbotMessages = (chatbotData: ChatbotResponse | null) => {
    return chatbotData?.messages.filter((msg) => msg.messageContent);
  };

  const getOtherParticipantId = (conversation: MessageData) => {
    return user && user.id !== conversation.message.senderId
      ? conversation.message.senderId
      : conversation.message.recipientId;
  };
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      display={{ base: "block", lg: "flex" }}
      height={"100%"}
      overflowY={"auto"}
      mx={{ base: "10px", sm: "20px", md: "40px" }}
    >
      {(!isViewingThread || !isMobile) && (
        <Box
          w={{ base: "100%", lg: "50%" }}
          display={"flex"}
          flexDir={"column"}
        >
          <Button
            bg={"#0CCEC2"}
            my={"10px"}
            //mx={{ base: "10px", sm: "20px", md: "40px" }}
            onClick={onOpen}
          >
            <Box display={"flex"} alignItems={"center"}>
              <Icon as={BiMessageEdit} h={"30px"} w={"30px"} mx={"10px"} />
              <Text>New Message</Text>
            </Box>
          </Button>
          <NewMessage
            isOpen={isOpen}
            onClose={onClose}
            contacts={contacts || []}
            currentUserId={user?.id || ""}
          />
          <Text
            textAlign={"left"}
            fontWeight={"medium"}
            fontSize={"x-large"}
            borderBottom={"1px solid black"}
          >
            Conversations:
          </Text>
          {chatbotData && (
            <Box mt={0}>
              <Box
                textAlign={"left"}
                key={"chatbot"}
                p={4}
                borderBottom="1px solid black"
                mt={0}
                //mx={{ base: "10px", sm: "20px", md: "40px" }}
                onClick={() => {
                  setSelectedConversation("chatbot");
                  if (isMobile) setIsViewingThread(true);
                }}
                cursor="pointer"
                bg={
                  selectedConversation === "chatbot"
                    ? "gray.500"
                    : "transparent"
                }
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Box display={"flex"} flexDir={"row"} alignItems={"center"}>
                  <UserThumbnail
                    firstName={"Chat"}
                    lastName={"Bot"}
                    diameter="40px"
                    fontSize="20px"
                  />
                  <Box ml={"15px"}>
                    <Box display={"flex"} alignItems={"center"}>
                      <Text fontWeight={"bold"} fontSize={"large"}>
                        ChatBot
                      </Text>
                      <Text fontSize={"sm"} ml={"50px"}>
                        {formatTimestamp(
                          chatbotData.messages[chatbotData.messages.length - 1]
                            ?.timestamp
                        )}
                      </Text>
                    </Box>
                    <Text>
                      ChatBot:{" "}
                      {chatbotData.messages[
                        chatbotData.messages.length - 1
                      ]?.messageContent.slice(0, 20)}
                      ...
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {messagesData && (
            <Box mt={0}>
              {uniqueConversations.map((conversationId) => {
                const conversation = getLatestMessage(conversationId);
                if (!conversation) return null;

                const otherParticipantId = getOtherParticipantId(conversation);
                const senderName =
                  conversation.message.senderId === user?.id
                    ? "You"
                    : conversationNames[conversation.message.senderId] ||
                      conversation.message.senderId;

                return (
                  <Box
                    textAlign={"left"}
                    key={conversationId}
                    p={4}
                    borderBottom="1px solid black"
                    mt={0}
                    //mx={{ base: "10px", sm: "20px", md: "40px" }}
                    onClick={() => {
                      setSelectedConversation(conversationId);
                      if (isMobile) setIsViewingThread(true);
                    }}
                    cursor="pointer"
                    bg={
                      selectedConversation === conversationId
                        ? "gray.500"
                        : "transparent"
                    }
                    display={"flex"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                  >
                    <Box display={"flex"} flexDir={"row"} alignItems={"center"}>
                      <UserThumbnail
                        firstName={
                          conversationNames[otherParticipantId]?.split(
                            " "
                          )[0] || "Unknown"
                        }
                        lastName={
                          conversationNames[otherParticipantId]?.split(
                            " "
                          )[1] || ""
                        }
                        diameter="40px"
                        fontSize="20px"
                      />
                      <Box ml={"15px"}>
                        <Box display={"flex"} alignItems={"center"}>
                          <Text fontWeight={"bold"} fontSize={"large"}>
                            {otherParticipantId
                              ? conversationNames[otherParticipantId] ||
                                otherParticipantId
                              : "Unknown"}
                          </Text>
                          <Text fontSize={"sm"} ml={"50px"}>
                            {formatTimestamp(conversation.message.timestamp)}
                          </Text>
                        </Box>
                        <Text>
                          {senderName}: {conversation.message.messageContent}
                        </Text>
                      </Box>
                    </Box>
                    <Button
                      colorScheme="red"
                      onClick={() => deleteConversation(conversationId)}
                    >
                      <Icon as={MdDeleteForever} />
                    </Button>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {selectedConversation && (!isMobile || isViewingThread) && (
        <Box w={{ base: "100%", lg: "50%" }} px={4}>
          {selectedConversation === "chatbot" ? (
            <ChatbotThread
              currentUserId={user?.id || ""}
              isViewingThread={isViewingThread}
              isMobile={isMobile}
              setIsViewingThread={setIsViewingThread}
              darkMode={darkMode}
              messageData={chatbotData}
            />
          ) : (
            <MessageThread
              darkMode={darkMode}
              messages={getConversationMessages(selectedConversation)}
              currentUserId={user?.id || ""}
              otherParticipantName={
                conversationNames[
                  getOtherParticipantId(getLatestMessage(selectedConversation)!)
                ] || "Unknown"
              }
              recipientId={getOtherParticipantId(
                getLatestMessage(selectedConversation)!
              )} // Passing recipientId
              isViewingThread={isViewingThread}
              isMobile={isMobile}
              setIsViewingThread={setIsViewingThread}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default Conversations;
