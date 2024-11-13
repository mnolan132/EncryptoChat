import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Select,
  Box,
  FormControl,
  Icon,
  Input,
  useToast,
} from "@chakra-ui/react";
import { BsFillSendFill } from "react-icons/bs";

interface Contact {
  id: string;
  firstName: string;
  email: string;
  lastName: string;
}

interface NewMessageProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[] | null; // Allow contacts to be null or an array
  currentUserId: string | undefined;
}

const MessageModal: React.FC<NewMessageProps> = ({
  isOpen,
  onClose,
  contacts = [], // Default to an empty array if contacts is null or undefined
  currentUserId,
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [messageContent, setMessageContent] = useState("");
  const toast = useToast();

  const handleContactSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContactId(event.target.value);
  };

  const sendMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://encrypto-chat-theta.vercel.app/message/new-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: currentUserId,
            recipientId: selectedContactId,
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send New Message</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={2}>Select a contact to send a message:</Text>
          <Select
            placeholder="Select a contact"
            value={selectedContactId}
            onChange={handleContactSelect}
            mb={4}
            isDisabled={!Array.isArray(contacts) || contacts.length === 0} // Ensure contacts is an array
          >
            {Array.isArray(contacts) &&
              contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                </option>
              ))}
          </Select>
          {selectedContactId && (
            <Text mt={4}>
              Selected Contact:{" "}
              {
                contacts?.find((contact) => contact.id === selectedContactId)
                  ?.firstName
              }
            </Text>
          )}
          <form onSubmit={sendMessage}>
            <FormControl>
              <Box display={"flex"}>
                <Input
                  placeholder="Type your message"
                  borderRightRadius={0}
                  borderLeftRadius={"15px"}
                  isDisabled={selectedContactId === ""}
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MessageModal;
