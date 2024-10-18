import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Box, Button, Image, Text, Flex, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalFooter, ModalBody, 
  ModalCloseButton, Input, FormLabel, useDisclosure, 
  useToast, Spinner, FormControl,
  VStack, IconButton
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";


interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  plainPassword: string;
  profilePicture?: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const userId = "3493999e-14f8-4e79-904f-b21c73ada225";

  const fetchUserProfile = async () => {
    try {
      console.log(`Fetching data for user: ${userId}`);
      const response = await axios.get(`http://localhost:5001/user/${userId}`);

      console.log('Response received:', response); // Debugging log
      if (response.status === 200) {
        setProfile(response.data); // Store data in state
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error fetching user profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);



  // Handle profile update submission
  const handleUpdateProfile = async () => {
    const payload = {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      plainPassword: profile?.plainPassword || '',
    };
  
    try {
      const response = await axios.put(
        `http://localhost:5001/users/${userId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
  
      toast({
        title: response.data.message || "Profile updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  
      fetchUserProfile(); // Refresh the profile data after update
      onClose(); // Close the update form/modal
    } catch (error) {
      console.error("Error updating profile:", error);
  
      toast({
        title: "Error updating profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  if (loading) return <Spinner />;

  return (
      <VStack bg="white" p={4} borderRadius={10} w={[300, 400, 500]} height={{base: "100%", md: "50%", xl: "25%"}}>
        <Box flexShrink={0}>
        {profile?.profilePicture ? (
          <img
            src={profile.profilePicture}
            alt="Profile"
            style={{ width: 100, height: 100, borderRadius: '50%' }}
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
            {getInitials(profile?.firstName || '', profile?.lastName || '')}
          </Flex>
        )}
      </Box>

        <Text fontWeight="bold" fontSize={{ base: '16px', md: '18px', lg: '22px' }}>{profile?.firstName} {profile?.lastName}</Text>
        <Text fontSize={{ base: '14px', md: '16px', lg: '20px' }}>Email: {profile?.email}</Text>
        {profile?.profilePicture && (
          <img 
            src={profile.profilePicture} 
            alt="Profile" 
            style={{ width: 100, height: 100, borderRadius: '50%' }} 
          />
        )}
        <IconButton aria-label="edit-btn" bg="none" icon={<EditIcon/>} onClick={onOpen} mt={4}/>

        {/* Modal for Profile Update */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input 
                  value={profile?.firstName || ''} 
                  onChange={(e) => setProfile({ ...profile!, firstName: e.target.value })} 
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Last Name</FormLabel>
                <Input 
                  value={profile?.lastName || ''} 
                  onChange={(e) => setProfile({ ...profile!, lastName: e.target.value })} 
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Email</FormLabel>
                <Input 
                  value={profile?.email || ''} 
                  onChange={(e) => setProfile({ ...profile!, email: e.target.value })} 
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Profile Picture</FormLabel>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleUpdateProfile}>
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
  );
};

export default ProfilePage;
