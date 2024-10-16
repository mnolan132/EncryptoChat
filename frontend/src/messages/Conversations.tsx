import { Box, Button, Icon, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiMessageEdit } from "react-icons/bi";
import MessageThread from "./Message";

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
  >({}); // Store the other user's names for each conversation
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null); // Track selected conversation

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0"); // Ensure it's two digits
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes} ${day}/${month}`;
  };

  // The async function to fetch messages
  const getMessages = async () => {
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
      const data: MessagesResponse = await response.json(); // Assuming the response matches the MessagesResponse type
      setMessagesData(data); // Save the fetched messages to state
      await fetchUserNames(data); // Fetch user names for the conversations
      setDefaultConversation(data); // Set the most recent conversation as the default
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // The async function to fetch user names based on message data
  const fetchUserNames = async (data: MessagesResponse) => {
    const conversations: Record<string, string> = {};

    // Extract unique conversation participants (other than the logged-in user)
    const conversationParticipants = Array.from(
      new Set(
        data.messages.map((msg) =>
          user && user.id !== msg.message.senderId
            ? msg.message.senderId
            : msg.message.recipientId
        )
      )
    );

    // Fetch names for each participant
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

    setConversationNames(conversations); // Save conversation names
  };

  // Set the most recent conversation as the default
  const setDefaultConversation = (data: MessagesResponse) => {
    if (!data || data.messages.length === 0) return;

    // Sort messages by timestamp and get the most recent conversationId
    const sortedMessages = [...data.messages].sort(
      (a, b) =>
        new Date(b.message.timestamp).getTime() -
        new Date(a.message.timestamp).getTime()
    );

    setSelectedConversation(sortedMessages[0].conversationId);
  };

  // Use useEffect to call the function when user is available
  useEffect(() => {
    if (user && user.id) {
      getMessages();
    }
  }, [user]); // Only run when the user changes

  // Get unique conversation IDs
  const uniqueConversations = messagesData
    ? Array.from(
        new Set(messagesData.messages.map((msg) => msg.conversationId))
      )
    : [];

  // Get the latest message in a conversation
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

  // Get all messages for the selected conversation
  const getConversationMessages = (conversationId: string) => {
    return messagesData?.messages.filter(
      (msg) => msg.conversationId === conversationId
    );
  };

  return (
    <Box display={{ base: "block", lg: "flex" }}>
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
        <Text fontSize={"xx-large"}>Messages</Text>
        {user && (
          <div>
            {Object.keys(user).map((key) => (
              <p key={key}>
                {key}: {user[key as keyof User]}
              </p>
            ))}
          </div>
        )}
        {messagesData && (
          <Box mt={4}>
            <Text fontSize={"large"}>Conversations:</Text>
            {uniqueConversations.map((conversationId) => {
              const conversation = getLatestMessage(conversationId);
              if (!conversation) return null;

              const otherParticipantId =
                user && user.id !== conversation.message.senderId
                  ? conversation.message.senderId
                  : conversation.message.recipientId;

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
                  onClick={() => setSelectedConversation(conversationId)} // Set conversation on click
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

      <Box w={{ base: "100%", lg: "50%" }} p={4}>
        {selectedConversation ? (
          <MessageThread
            messages={getConversationMessages(selectedConversation)} // Pass the selected conversation's messages
            currentUserId={user?.id || ""} // Pass the current user's ID
          />
        ) : (
          <Text>No conversation selected.</Text>
        )}
      </Box>
    </Box>
  );
};

export default Conversations;
