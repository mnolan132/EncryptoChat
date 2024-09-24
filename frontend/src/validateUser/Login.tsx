import { useState } from "react";
import {
  Input,
  Stack,
  InputGroup,
  FormControl,
  InputRightElement,
  Button,
  Box,
  Text,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

interface LoginProps {
  handleSelectSignup: () => void;
  showPassword: () => void;
  show: boolean;
  selectSignup: boolean;
}

const Login: React.FC<LoginProps> = ({
  handleSelectSignup,
  showPassword,
  show,
  selectSignup,
}): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box display={selectSignup ? "none" : "block"}>
      <form>
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
        <Button bg={"#0CCEC2"} size={"lg"} m={"25px"}>
          Log In
        </Button>
      </form>
      <Text>
        Don't have an account?
        <Box onClick={handleSelectSignup}>
          <Text as={"b"}>Sign up here</Text>
        </Box>
      </Text>
    </Box>
  );
};

export default Login;
