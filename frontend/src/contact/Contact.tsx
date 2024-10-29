import React, { useState, useEffect } from "react";
import { 
  Box, Button, Text, useToast, Image, Flex, useDisclosure, Input,
  VStack, useBreakpointValue, Icon, HStack,
} from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, DeleteIcon, EmailIcon, SettingsIcon, CloseIcon} from "@chakra-ui/icons";


type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  contactPicture?: string;
};

interface ContactProps {
  user: null | User;
};

const ContactsPage: React.FC<ContactProps> = ({ user }) => {
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isViewingContact, setIsViewingContact] = useState(false);
  const toast = useToast();

  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { onClose } = useDisclosure();


  // Fetch contacts on component mount
  useEffect(() => {
    if (user?.id) {
      fetchContacts();
    }
  }, [user]);


  //Get the contacts from the database
  const fetchContacts = async() => {
    console.log("Fetching contacts....")
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/contacts/getContacts/${user?.id}`);
      console.log("Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      setContacts(data.contacts || []);
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
    if (!firstName || !lastName || !email) {
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
      const payload = {
        firstName,
        lastName,
        email,
      };
  
      // Send the contact to both sender and recipient
      const response = await axios.post(
        `http://localhost:5001/contacts/addContact/${user?.id}`, payload
      );
  
      // Update contact list with the new contact for the sender (current user)
      setContacts([
        ...contacts,
        { id: response.data.contactUserId, ...payload },
      ]);
  
      // Reset the input fields
      setFirstName("");
      setLastName("");
      setEmail("");
  
      toast({
        title: "Contact Added",
        description: "Contact added successfully for both users.",
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
      await axios.delete(`http://localhost:5001/contacts/deleteContact/${user?.id}/${contactId}`, { data: {id: contactId } });
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

  //Get the first letter from both firstName and lastName
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  if (!user) {
    return <div>Loading user...</div>; 
  }
  if (loading) return <div>Loading contacts...</div>;


  return ( 
    <Box
      display={{ base: "block", lg: "flex" }}
      height={"100%"}
      overflowY={"auto"}
    >
    {(!isViewingContact || !isMobile) && (
      <Box
        w={{ base: "100%", lg: "50%" }}
        display={"flex"}
        flexDir={"column"}
      >
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
            <Icon as={AddIcon} h={"20px"} w={"20px"} mx={"10px"} />
            <Text>Add Contact</Text>
          </Box>
        </Button>
        {showAddForm && (
          <VStack spacing={4} mb={8} display={"flex"}>
            <HStack justifyContent="space-between" w="100%">
              <Text fontSize="2xl" fontWeight="bold">
                Add New Contact
              </Text>
              <Button size="sm" onClick={() => setShowAddForm(false)}>
                <CloseIcon />
              </Button>
            </HStack>
            <Input
              placeholder="Enter First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              placeholder="Enter Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Flex direction={"row"} gap={8}>
            <Button bg="#0CCEC2" onClick={handleAddContact}>
              Save
            </Button>
            <Button onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            </Flex>
          </VStack>
        )}
        <Text
          textAlign={"left"}
          fontWeight={"medium"}
          fontSize={"x-large"}
          borderBottom={"1px solid black"}
        >
          Contacts:
        </Text>
        <Box>
        {contacts.map((contact) => (
          <Flex
            key={contact.id}
            p={2}
            align="center"
            cursor="pointer"
            onClick={() => {
              setSelectedContact(contact);
              if (isMobile) setIsViewingContact(true);
              setShowAddForm(false);
            }}
            bg={selectedContact?.id === contact.id ? "gray.200" : "transparent"}
            _hover={{ bg: "gray.100" }}
          >
          <Box>
            {contact?.contactPicture ? (
              <Image
                boxSize="100px"
                borderRadius="full"
                src={contact.contactPicture}
                alt={`${contact.firstName} ${contact.lastName}`}
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
                {getInitials(contact?.firstName || "", contact?.lastName || "")}                
              </Flex>
            )} 
          </Box>

          <Box>
            <Text fontWeight="bold">
              {contact?.firstName || "firstname"} {contact?.lastName || "lastname"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {contact.email}
            </Text>
          </Box>
        </Flex>
        ))}
        </Box>
      </Box>
    )}
    {selectedContact && (!isMobile || isViewingContact) && (
      <VStack w={{ base: "100%", lg: "50%" }} px={4} mt={10}>
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
            {getInitials(selectedContact?.firstName || "", selectedContact?.lastName || "")}
          </Flex>
          
        )}
        <Text fontWeight="bold" fontSize="2xl">
          {selectedContact.firstName}
          {selectedContact.lastName}
        </Text>
        <Text fontSize="lg">{selectedContact.email}</Text>
        <Flex mt={4} justify="space-between">
          <Button variant={"ghost"} leftIcon={<EmailIcon />} />
          <Button
            variant={"ghost"}
            rightIcon={<DeleteIcon />}
            onClick={() => handleDeleteContact(selectedContact.id)}
          />
          <Button variant={"ghost"} rightIcon={<SettingsIcon />} />
        </Flex>
      </VStack>
    )}
    </Box>
  );
};

export default ContactsPage;

