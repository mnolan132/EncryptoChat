import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Box, 
  Button, 
  Image, 
  Text, 
  Flex,  
  Input, 
  FormLabel, 
  useDisclosure, 
  useToast, 
  FormControl, 
  VStack, 
  IconButton, 
  HStack, 
  Divider
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import UserThumbnail from "../utiltyComponent/UserThumbnail";


type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
};

type UserData = {
  plainPassword: string;
  profilePicture?: string;
}

interface UserProfileProps {
  user: null | User;
}

const ProfilePage: React.FC<UserProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [profilePicture, setProfilePicture] = useState<UserData | null>(null);
  const [plainPassword, setPlainPassword] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const toast = useToast();
  const { onClose } = useDisclosure();

  //const userId = "3493999e-14f8-4e79-904f-b21c73ada225";

  const fetchUserProfile = async () => {
    try {
      console.log(`Fetching data for user: ${user?.id}`);
      const response = await axios.get(`http://localhost:5001/user/${user?.id}`);

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
  }, [user]);



  // Handle profile update submission
  const handleUpdateProfile = async () => {
    const payload = {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      plainPassword: plainPassword?.plainPassword || '',
    };
  
    try {
      const response = await axios.put(
        `http://localhost:5001/profile/user/${user?.id}`,
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

  if (loading) return <div>Loading profile...</div>;

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      align="stretch"
      height="100%"
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
          {profilePicture?.profilePicture ? (
            <Image
              boxSize="100px"
              borderRadius="full"
              src={profilePicture.profilePicture}
              alt="Profile"
            />
          ) : (
            <Box display={"flex"} flexDir={"row"} alignItems={"center"}>
              <UserThumbnail
                firstName={
                  profile?.firstName.split(
                    " "
                  )[0] || "Unknown"
                }
                lastName={
                  profile?.lastName.split(
                    " "
                  )[0] || ""
                }
                diameter="100px"
                fontSize="40px"
              />
            </Box>
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
          onClick={() => setEditMode((prev) => !prev)}
        />
      </Box>

      {/* Right Side for bigger screen: Edit Profile Form */}
      <Box
        flex={1}
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="lg"
        display={{base: editMode ? "block" : "none", md: "block"}}
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
              value={plainPassword?.plainPassword || ""}
              onChange={(e) => setPlainPassword({ ...plainPassword!, plainPassword: e.target.value })
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
