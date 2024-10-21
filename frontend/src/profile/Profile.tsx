import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Box, Button, Image, Text, Flex,  
  Input, FormLabel, useDisclosure, 
  useToast, Spinner, FormControl, 
  VStack, IconButton, HStack, Divider
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
  const [editMode, setEditMode] = useState<boolean>(false);
  const toast = useToast();
  const { onClose } = useDisclosure();

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
        `http://localhost:5001/profile/user/${userId}`,
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
    <Flex
      direction={{ base: "column", md: "row" }}
      align="stretch"
      height="93vh"
      p={4}
      gap={6}
    >
      {/* Left Side: Profile Information */}
      <Box
        flex={1}
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="lg"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Box>
          {profile?.profilePicture ? (
            <Image
              boxSize="100px"
              borderRadius="full"
              src={profile.profilePicture}
              alt="Profile"
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
            >
              {getInitials(profile?.firstName || "", profile?.lastName || "")}
            </Flex>
          )}
        </Box>
        <Text fontWeight="bold" fontSize="2xl" mt={4}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text fontSize="lg">{profile?.email}</Text>
        <IconButton
          mt={4}
          aria-label="Edit Profile"
          icon={<EditIcon />}
          onClick={() => setEditMode(true)}
        />
      </Box>

      <Box display={{ base: "block", md: "none" }}>
        <Divider orientation="horizontal" />
      </Box>
      <Box display={{ base: "none", md: "block" }}>
        <Divider orientation="vertical" />
      </Box>

      {/* Right Side: Edit Profile Form */}
      <Box
        flex={1}
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="lg"
        display={editMode ? "block" : "none"}
      >
        <VStack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">
            Edit Profile
          </Text>

          <FormControl>
            <FormLabel>First Name</FormLabel>
            <Input
              value={profile?.firstName || ""}
              onChange={(e) =>
                setProfile({ ...profile!, firstName: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Last Name</FormLabel>
            <Input
              value={profile?.lastName || ""}
              onChange={(e) =>
                setProfile({ ...profile!, lastName: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              value={profile?.email || ""}
              onChange={(e) =>
                setProfile({ ...profile!, email: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Change Password</FormLabel>
            <Input
              value={profile?.plainPassword || ""}
              onChange={(e) => setProfile({ ...profile!, plainPassword: e.target.value })
            }
            />
          </FormControl>

          <HStack spacing={4}>
            <Button bg={"#0CCEC2"} onClick={handleUpdateProfile}>
              Save
            </Button>
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ProfilePage;
