import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  useToast,
  Image,
  Flex,
  useDisclosure,
  Input,
  VStack,
  useBreakpointValue,
  Icon,
  HStack,
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  EmailIcon,
  SettingsIcon,
  CloseIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import axios from "axios";
import NewMessage from "../messages/NewMessage";
import { IoReturnDownBack } from "react-icons/io5";
import UserThumbnail from "../utiltyComponent/UserThumbnail";



type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  contactPicture?: string;
};

interface ContactProps {
  user: null | User;
}

const ContactsPage: React.FC<ContactProps> = ({ user }) => {
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isViewingContact, setIsViewingContact] = useState(false);
  const toast = useToast();

  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch contacts on component mount
  useEffect(() => {
    if (user?.id) {
      fetchContacts();
    }
  }, [user]);

  //Get the contacts from the database
  const fetchContacts = async () => {
    console.log("Fetching contacts....");
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/contacts/getContacts/${user?.id}`
      );
      console.log("Response status:", response.status);

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
        `http://localhost:5001/contacts/addContact/${user?.id}`,
        payload
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
    console.log("Deleting contact with ID:", contactId);
    try {
      await axios.delete(
        `http://localhost:5001/contacts/deleteContact/${user?.id}/${contactId}`,
        { data: { id: contactId } }
      );
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

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (loading) return <div>Loading contacts...</div>;

  return (
    <Box
      display={{ base: "block", lg: "flex" }}
      height={"100%"}
      overflowY={"auto"}
    >
      <Box
        top={0}
        bg="white"
        zIndex={1}
        p={1}
        borderBottom="1px solid lightgray"
        display={"flex"}
        alignItems={"center"}
      >
        {isViewingContact && isMobile && (
          <Button onClick={() => setIsViewingContact(false)} mx={2}>
            <Icon as={IoReturnDownBack} />
          </Button>
        )}
        {selectedContact && (isViewingContact || !isMobile) && (
          <Text 
            fontWeight={"medium"} 
            fontSize={"large"} 
            textAlign={"left"}
            display={{ base: "block", lg: "none" }}
          >
            Back to Contacts
          </Text>
        )}
      </Box>
       
    {(!isViewingContact || !isMobile) && (
      <Box
        w={{ base: "100%", lg: "50%" }}
        display={"flex"}
        flexDir={"column"}
      >
        <HStack mx={{base: 5, lg: 10}} mt={4}>
          <Input
            placeholder="Search contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="filled"
          />
          <Button leftIcon={<SearchIcon />} colorScheme="teal">
            Search
          </Button>
        </HStack>
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
          ml={{ base: "10px", sm: "20px", md: "40px" }}
          mr={{ base: "10px", sm: "20px", md: "40px" }}
        >
          Contacts
        </Text>
        <Box>
        {filteredContacts.map((contact) => (
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
          <Box ml={{ base: "10px", sm: "20px", md: "40px" }}>
            {contact?.contactPicture ? (
              <Image
                boxSize="100px"
                borderRadius="full"
                src={contact.contactPicture}
                alt={`${contact.firstName} ${contact.lastName}`}
                mr={4}
              /> 
            ) : (
              <Box display={"flex"} flexDir={"row"} alignItems={"center"}>
                <UserThumbnail
                  firstName={
                    contact?.firstName.split(
                      " "
                    )[0] || "Unknown"
                  }
                  lastName={
                    contact?.lastName.split(
                      " "
                    )[0] || ""
                  }
                  diameter="100px"
                  fontSize="40px"
                />
              </Box>
            )} 
          </Box>
            <Box ml="20px">
              <Text fontWeight="bold">
                {contact?.firstName || "firstname"}{" "}
                {contact?.lastName || "lastname"}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {contact.email}
              </Text>
            </Box>
            <Box textAlign="right" flex={1}>
              <Button
                variant={"ghost"}
                leftIcon={<EmailIcon />}
                onClick={onOpen}
              />
              <NewMessage
                isOpen={isOpen}
                onClose={onClose}
                contacts={contacts}
                currentUserId={user?.id}
              />
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
            <Box display={"flex"} flexDir={"row"} alignItems={"center"}>
                <UserThumbnail
                  firstName={
                    selectedContact?.firstName.split(
                      " "
                    )[0] || "Unknown"
                  }
                  lastName={
                    selectedContact?.lastName.split(
                      " "
                    )[0] || ""
                  }
                  diameter="100px"
                  fontSize="40px"
                />
              </Box>
          )}
          <Text fontWeight="bold" fontSize="2xl">
            {selectedContact.firstName}
            {selectedContact.lastName}
          </Text>
          <Text fontSize="lg">{selectedContact.email}</Text>
          <Flex mt={4} justify="space-between">
            <Button
              variant={"ghost"}
              leftIcon={<EmailIcon />}
              onClick={onOpen}
            />
            <NewMessage
              isOpen={isOpen}
              onClose={onClose}
              contacts={contacts}
              currentUserId={user?.id}
            />
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
