import {
  Box,
  FormControl,
  Input,
  Stack,
  InputGroup,
  InputRightElement,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";

interface SignupProps {
  handleSelectSignup: () => void;
  showPassword: () => void;
  show: boolean;
  selectSignup: boolean;
}

const Signup: React.FC<SignupProps> = ({
  handleSelectSignup,
  showPassword,
  show,
  selectSignup,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toast = useToast();

  const createUser = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/user/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          plainPassword: password,
        }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      toast({
        title: "Account created!",
        description: "Head back to the log in screen and sign in",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box display={!selectSignup ? "none" : "block"}>
      <form onSubmit={createUser}>
        <Box boxShadow="lg" rounded="lg" bg="white" m={"25px"}>
          <FormControl isRequired>
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(event) => setFirstName(event.currentTarget.value)}
              border={"none"}
              shadow={3}
            />
          </FormControl>
        </Box>
        <Box boxShadow="lg" rounded="lg" bg="white" m={"25px"}>
          <FormControl isRequired>
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(event) => setLastName(event.currentTarget.value)}
              border={"none"}
              shadow={3}
            />
          </FormControl>
        </Box>
        <Box boxShadow="lg" rounded="lg" bg="white" m={"25px"}>
          <FormControl isRequired>
            <Input
              type="text"
              placeholder="Email Address"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              border={"none"}
              shadow={3}
            />
          </FormControl>
        </Box>
        <Box boxShadow="lg" rounded="lg" bg="white" m={"25px"}>
          <Stack spacing={4} w="300px" my="10px">
            <InputGroup>
              <FormControl isRequired>
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                />
              </FormControl>
              <InputRightElement pointerEvents="visible">
                <Button
                  size="sm"
                  onClick={showPassword}
                  m="3px"
                  _hover={{ bg: "none" }}
                >
                  {show ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </Stack>
        </Box>
        <Box boxShadow="lg" rounded="lg" bg="white" m={"25px"}>
          <Stack spacing={4} w="300px" my="10px">
            <InputGroup>
              <FormControl isRequired>
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.currentTarget.value)
                  }
                />
              </FormControl>
              <InputRightElement pointerEvents="visible">
                <Button
                  size="sm"
                  onClick={showPassword}
                  m="3px"
                  _hover={{ bg: "none" }}
                >
                  {show ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </Stack>
        </Box>
        <Button type={"submit"} bg={"#0CCEC2"} size={"lg"} m={"25px"}>
          Sign Up
        </Button>
      </form>
      <Text>
        <Box onClick={handleSelectSignup}>
          <Text as={"b"}> Back to log in</Text>
        </Box>
      </Text>
    </Box>
  );
};

export default Signup;
