import React, { useState, useEffect } from "react";
import { 
  Box, Button, Text, useToast, Image, Flex, useDisclosure, Input,
  VStack, Spinner
} from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, DeleteIcon, EmailIcon, SettingsIcon } from "@chakra-ui/icons";

interface Contact {
  id: string;
  name: string;
  email: string;
  contactPicture?: string;
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const userId = "3493999e-14f8-4e79-904f-b21c73ada225"; //Change this to actual userId based on the logged in.

  const { onClose } = useDisclosure();

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Get contacts
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

  // Add contact by entering name and email
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

  // Delete contact in the database using userId and contactId
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

  // Shows each contact details
  // const handleContactClick = (contact: Contact) => {
  //   setSelectedContact(contact);
  // };

  const getInitials = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return `${(firstName?.[0] || "")}${(lastName?.[0] || "")}`.toUpperCase();
  };


  if (loading) return <Spinner />;

  return ( 
    <Box display={{ base: "block", lg: "flex" }} height="93vh" m={"10px"}>
      {/* Left Panel: Contact List */}
      <Box w={{ base: "100%", lg: "50%" }} display={"flex"} flexDir={"column"}>
        <Button
          bg={"#0CCEC2"}
          my={"10px"}
          mx={{ base: "10px", sm: "20px", md: "40px" }}
          onClick={() => {
            setShowAddForm(true);
            setSelectedContact(null);
          }}
        >
          <Box display={"flex"} alignItems={"center"}>
            <AddIcon h={"20px"} w={"20px"} mx={"20px"} />
            <Text>Add Contact</Text>
          </Box>
        </Button>
        {contacts.map((contact) => (
          <Flex
            key={contact.id}
            p={2}
            align="center"
            cursor="pointer"
            onClick={() => {
              setSelectedContact(contact);
              setShowAddForm(false);
            }}
            bg={selectedContact?.id === contact.id ? "gray.200" : "transparent"}
            _hover={{ bg: "gray.100" }}
          >
            <Box>
              {contact?.contactPicture ? (
                <Image
                boxSize="50px"
                borderRadius="full"
                src={contact.contactPicture}
                alt="Profile"
                mr={4}
              /> 
              ) : (
                <Flex
                  width={100}
                  height={100}
                  borderRadius="50%"
                  bg="gray.300"
                  align="center"
                  justify="center"
                  fontSize="32px"
                  fontWeight="bold"
                  color="white"
                >
                  {getInitials(contact.name)}                
                </Flex>
              )} 
            </Box>
            
            <Box>
              <Text fontWeight="bold">{contact.name}</Text>
              <Text fontSize="sm" color="gray.500">
                {contact.email}
              </Text>
            </Box>
          </Flex>
        ))}
      </Box>

      {/* Right Panel: Contact Details or Add Form */}
      <Box w={{ base: "100%", lg: "50%" }} p={4}>
        {showAddForm ? (
          <VStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold">
              Add New Contact
            </Text>
            <Input
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button bg={"#0CCEC2"} onClick={handleAddContact}>
              Save
            </Button>
          </VStack>
        ) : selectedContact ? (
          <Box>
            <VStack>
            {selectedContact.contactPicture ? (
              <Image
                boxSize={"100px"}
                borderRadius="full"
                src={selectedContact.contactPicture}
                alt="Profile"
                mb={4}
              />
            ) : (
              <Flex
                width="100px"
                height="100px"
                borderRadius="full"
                bg="gray.300"
                align="center"
                justify="center"
                fontSize="40px"
                fontWeight="bold"
                color="white"
                mb={4}
              >
                {getInitials(selectedContact.name)}
              </Flex>
            )}
            <Text fontWeight="bold" fontSize="2xl">
              {selectedContact.name}
            </Text>
            <Text fontSize="lg">{selectedContact.email}</Text>
            <Flex mt={4} justify="space-between">
              <Button bg={"none"} leftIcon={<EmailIcon />} />
              <Button
                bg={"none"} 
                rightIcon={<DeleteIcon />}
                onClick={() => handleDeleteContact(selectedContact.id)}
              />
              <Button bg={"none"} rightIcon={<SettingsIcon />} />
            </Flex>
            </VStack>
            
          </Box>
        ) : (
          <Text>No contact selected.</Text>
        )}
      </Box>
      </Box>
  );
};

export default ContactsPage;

