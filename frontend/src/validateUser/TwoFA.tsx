import { Box, Input, Text, Button, useToast } from "@chakra-ui/react";
import { useState } from "react";

type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
};

interface TwoFAProps {
  viewTwoFA: boolean;
  userIdString: null | string;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<null | User>>;
  user: null | User;
}

const TwoFA: React.FC<TwoFAProps> = ({
  viewTwoFA,
  userIdString,
  setIsLoggedIn,
  setUser,
  user,
}) => {
  const [pin, setPin] = useState("");

  const toast = useToast();

  const getUser = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5001/user/${userIdString}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Testing getUser function, user data: ${data}`);
      setUser(data);
      console.log(`user state data: ${user}`);
    } catch (error) {
      console.error(error);
    }
  };

  const verify2fa = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userIdString, secretAttempt: pin }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      toast({
        title: "Log in successful",
        description: "Welcome back",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      setIsLoggedIn(true);
      getUser(e);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box display={viewTwoFA ? "block" : "none"}>
      <Text>We have sent you an email with a 4-digit pin code</Text>
      <Text>Enter the pin code below:</Text>
      <form onSubmit={verify2fa}>
        <Input
          placeholder="Pin code"
          type="text"
          value={pin}
          onChange={(event) => {
            setPin(event.currentTarget.value);
          }}
        />
        <Button type={"submit"} bg={"#0CCEC2"} size={"lg"} m={"25px"}>
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default TwoFA;
