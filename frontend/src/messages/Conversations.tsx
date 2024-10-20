import { Box, Button, Icon, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiMessageEdit } from "react-icons/bi";
import MessageThread from "./MessageThread";
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
}

const Conversations: React.FC<MessagesProps> = ({ user }) => {
  const [messagesData, setMessagesData] = useState<MessagesResponse | null>(
    null
  );
  const [conversationNames, setConversationNames] = useState<
    Record<string, string>
  >({});
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  // Function to fetch messages from the database
  const fetchMessages = async (): Promise<MessagesResponse | null> => {
    try {
      const response = await fetch(
        `http://localhost:5001/message/get-messages/${user?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching messages:", error);
      return null;
    }
  };

  // Function to check if new messages have been received
  const checkForNewMessages = async () => {
    const newMessagesData = await fetchMessages();
    if (newMessagesData && newMessagesData.messages.length > 0) {
      if (
        !messagesData ||
        newMessagesData.messages.length !== messagesData.messages.length
      ) {
        setMessagesData(newMessagesData); // Update state with new messages
        await fetchUserNames(newMessagesData); // Fetch names again if needed
        setDefaultConversation(newMessagesData); // Set default conversation
      }
    }
  };

  // Fetch user names based on message data
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
            `http://localhost:5001/user/${participantId}`
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

  // Set the most recent conversation as default
  const setDefaultConversation = (data: MessagesResponse) => {
    if (!data || data.messages.length === 0) return;
    const sortedMessages = [...data.messages].sort(
      (a, b) =>
        new Date(b.message.timestamp).getTime() -
        new Date(a.message.timestamp).getTime()
    );
    setSelectedConversation(sortedMessages[0].conversationId);
  };

  // useEffect to start polling every 3 seconds for new messages
  useEffect(() => {
    if (user && user.id) {
      // Fetch messages initially
      checkForNewMessages();

      // Set interval to check every 3 seconds
      const intervalId = setInterval(() => {
        checkForNewMessages();
      }, 3000); // 3000 ms = 3 seconds

      // Clear interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [user]); // Only run when the user changes

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

    return conversationMessages.reduce((latest, current) => {
      return new Date(latest.message.timestamp) >
        new Date(current.message.timestamp)
        ? latest
        : current;
    });
  };

  const getConversationMessages = (conversationId: string) => {
    return messagesData?.messages.filter(
      (msg) => msg.conversationId === conversationId
    );
  };

  const getOtherParticipantId = (conversation: MessageData) => {
    return user && user.id !== conversation.message.senderId
      ? conversation.message.senderId
      : conversation.message.recipientId;
  };

  return (
    <Box display={{ base: "block", lg: "flex" }} height={"93vh"}>
      <Box w={{ base: "100%", lg: "50%" }} display={"flex"} flexDir={"column"}>
        <Button
          bg={"#0CCEC2"}
          my={"10px"}
          mx={{ base: "10px", sm: "20px", md: "40px" }}
        >
          <Box display={"flex"} alignItems={"center"}>
            <Icon as={BiMessageEdit} h={"30px"} w={"30px"} mx={"10px"} />
            <Text>New Message</Text>
          </Box>
        </Button>
        <Text textAlign={"left"} fontWeight={"medium"} fontSize={"x-large"}>
          Conversations:
        </Text>
        {messagesData && (
          <Box mt={4}>
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
                  p={2}
                  borderY="1px solid black"
                  mt={2}
                  onClick={() => setSelectedConversation(conversationId)}
                  cursor="pointer"
                  bg={
                    selectedConversation === conversationId
                      ? "gray.200"
                      : "transparent"
                  }
                >
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
              );
            })}
          </Box>
        )}
      </Box>

      <Box w={{ base: "100%", lg: "50%" }} px={4}>
        {selectedConversation ? (
          <MessageThread
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
          />
        ) : (
          <Text>No conversation selected.</Text>
        )}
      </Box>
    </Box>
  );
};

export default Conversations;
