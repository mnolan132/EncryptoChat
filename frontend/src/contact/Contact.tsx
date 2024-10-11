import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  useToast,
  Image,
  Flex,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  useDisclosure,
  Input,
  useBreakpointValue,
  Center,
} from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, DeleteIcon, EmailIcon, SettingsIcon } from "@chakra-ui/icons";

interface Contact {
  id: string;
  name: string;
  email: string;
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const userId = "3493999e-14f8-4e79-904f-b21c73ada225"; //Change this to actual userId based on the logged in.

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Responsive layout detection
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5001/contacts/getContacts/${userId}`);
      setContacts(response.data.contacts);
    } catch (error) {
      console.error("Error fetching contacts", error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!name || !email) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and email.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5001/contacts/addContact/${userId}`, { name, email });
      setContacts([...contacts, { id: response.data.contactUserId, name, email }]);
      setName("");
      setEmail("");
      toast({
        title: "Contact Added",
        description: "Contact has been successfully added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error("Error adding contact", error);
      toast({
        title: "Error",
        description: "Failed to add contact.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    console.log("Deleting contact with ID:", contactId)
    try {
      await axios.delete(`http://localhost:5001/contacts/deleteContact/${userId}/${contactId}`, { data: {id: contactId } });
      setContacts(contacts.filter((contact) => contact.id !== contactId));
      toast({
        title: "Contact Deleted",
        description: "Contact has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting contact", error);
      toast({
        title: "Error",
        description: "Failed to delete contact.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };  

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  return (
    <Box p={6} minH="100vh" bg="gray.50">
      <Flex
        direction={{ base: "column", lg: "row" }}
        maxW="100%"
        justifyContent="center"
        alignItems={{ base: "flex-start", lg: "center" }}
      >
        {/* Contact list*/}
        <Box
          p={4}
          maxW={{ base: "100%", lg: "40%" }}
          w="100%"
          borderRadius="lg"
          boxShadow="none"
          bg="white"
          mb={{ base: 6, lg: 0 }}
          mt={{ base: 10, lg: 0 }}
        >
          <Box textAlign="center" mb={6}>
            <Button onClick={onOpen} w="100%" leftIcon={<AddIcon />}>
              Add Contact
            </Button>
          </Box>
           {/* Add contact modal */}
           <Modal isOpen={isOpen} onClose={onClose} size="xs" >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add Contact</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box m="10px">
                  <Input 
                  placeholder="Enter Name" 
                  size="md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  />
                </Box>
                <Box m="10px">
                  <Input 
                  placeholder="Enter Email" 
                  size="md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  />
                </Box>
              </ModalBody>
              <ModalFooter>
                <Box m="10px">
                  <Button colorScheme="blue" mr={3} onClick={handleAddContact}>
                    Save
                  </Button>
                </Box>
              </ModalFooter>
            </ModalContent>
          </Modal>
          {contacts.map((contact) => (
            <Flex
              key={contact.id}
              direction="row"
              align="center"
              mb={4}
              maxW="100%"
              cursor="pointer"
              onClick={() => handleContactClick(contact)}
              _hover={{ bg: "gray.100" }}
            >
              <Image
                boxSize="75px"
                borderRadius="10px"
                src="https://via.placeholder.com/150"
                alt="Contact Image"
                mb={{ base: 4, lg: 0 }}
              />
              <Box pl={4}>
                <Text fontWeight="bold" fontSize="md">{contact.name}</Text>
                <Text fontSize="sm" color="gray.500">{contact.email}</Text>
              </Box>
            </Flex>
          ))}
        </Box>

        {/* Contact details modal */}
        {selectedContact && (
          isMobile ? (
            <Modal 
            size="xs" 
            isOpen={!!selectedContact} onClose={() => setSelectedContact(null)}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalCloseButton />
                <ModalBody>
                  <Flex direction="column" alignItems="center" justifyContent="center">
                    <Image textAlign="center" boxSize="75px" borderRadius="10px" src="https://via.placeholder.com/150" alt="Contact Image" mb={4} />
                    <Text>{selectedContact.name}</Text>
                    <Text>{selectedContact.email}</Text>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Button bg="none" leftIcon={<EmailIcon />} />
                  <Button bg="none" mr={3} leftIcon={<DeleteIcon />} onClick={() => handleDeleteContact(selectedContact.id)} />
                  <Button bg="none" rightIcon={<SettingsIcon />} />
                  
                </ModalFooter>
              </ModalContent>
            </Modal>
          ) : (
            <Box
              p={4}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="sm"
              bg="white"
              maxW="40%"
              ml={4}
            >
              <Image
                boxSize="75px"
                borderRadius="10px"
                src="https://via.placeholder.com/150"
                alt="Contact Image"
                mb={4}
              />
              <Text fontWeight="bold" fontSize="xl">{selectedContact.name}</Text>
              <Text>{selectedContact.email}</Text>
              <Flex mt={4} justify="space-between">
                <Button leftIcon={<EmailIcon />} />
                <Button rightIcon={<DeleteIcon />} onClick={() => handleDeleteContact(selectedContact.id)} />
                <Button rightIcon={<SettingsIcon />} />
              </Flex>
            </Box>
          )
        )}
      </Flex>
    </Box>
   
  );
};

export default ContactsPage;

