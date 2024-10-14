import { Box, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";

type User = {
  email: string;
  firstName: string;
  userId: string;
  lastName: string;
};

interface MessagesProps {
  user: null | User;
}

const Messages: React.FC<MessagesProps> = ({ user }) => {
  const getMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/message/get-messages/${user?.userId}`,
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
      const data = await response.json();
      console.log(`Testing get-messages function, message data: ${data}`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user && user.userId) {
      getMessages();
    }
  }, [user]); // Dependency array ensures it only runs when `user` changes

  return (
    <Box>
      <Text fontSize={"xx-large"}>Messages</Text>
      {user && (
        <div>
          {Object.keys(user).map((key) => (
            <p key={key}>
              {key}: {user[key as keyof User]}{" "}
              {/* Cast the key to `keyof User` */}
            </p>
          ))}
        </div>
      )}
    </Box>
  );
};

export default Messages;
