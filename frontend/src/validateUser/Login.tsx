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
import TwoFA from "./TwoFA";

interface LoginProps {
  handleSelectSignup: () => void;
  showPassword: () => void;
  show: boolean;
  selectSignup: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<LoginProps> = ({
  handleSelectSignup,
  showPassword,
  show,
  selectSignup,
  setIsLoggedIn,
}): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [viewTwoFA, setViewTwoFA] = useState(false);
  const [userIdString, setUserIdString] = useState(null);

  const handle2FAComponent = () => {
    setViewTwoFA(!viewTwoFA);
  };

  const send2FA = async (e: { preventDefault: () => void }, userId: string) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/auth/enable-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const logIn = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, plainPassword: password }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const userId = data.userId;
      setUserIdString(userId);
      send2FA(e, userId);

      handle2FAComponent();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Box display={selectSignup || viewTwoFA ? "none" : "block"}>
        <Box>
          <form onSubmit={logIn}>
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
                      onChange={(event) =>
                        setPassword(event.currentTarget.value)
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
      </Box>
      <TwoFA
        userIdString={userIdString}
        viewTwoFA={viewTwoFA}
        setIsLoggedIn={setIsLoggedIn}
      />
    </>
  );
};

export default Login;
