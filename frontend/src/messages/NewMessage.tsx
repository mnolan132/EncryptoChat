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
} from "@chakra-ui/react";
import { BsFillSendFill } from "react-icons/bs";

interface Contact {
  id: string;
  name: string;
  email: string;
  contactPicture?: string;
}

interface NewMessageProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[] | null; // Allow contacts to be null or an array
}

const MessageModal: React.FC<NewMessageProps> = ({
  isOpen,
  onClose,
  contacts = [], // Default to an empty array if contacts is null or undefined
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>("");

  const handleContactSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContactId(event.target.value);
  };

  const handleSendMessage = () => {
    const selectedContact = contacts?.find(
      (contact) => contact.id === selectedContactId
    );
    if (selectedContact) {
      console.log(`Sending message to: ${selectedContact.name}`);
      onClose();
    } else {
      alert("Please select a contact to send a message.");
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
                  {contact.name}
                </option>
              ))}
          </Select>
          {selectedContactId && (
            <Text mt={4}>
              Selected Contact:{" "}
              {
                contacts?.find((contact) => contact.id === selectedContactId)
                  ?.name
              }
            </Text>
          )}
          <FormControl>
            <Box display={"flex"}>
              <Input
                placeholder="Type your message"
                borderRightRadius={0}
                borderLeftRadius={"15px"}
                isDisabled={selectedContactId === ""}
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MessageModal;
