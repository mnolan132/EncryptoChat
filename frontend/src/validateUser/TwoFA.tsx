import { Box, Input, Text, Button } from "@chakra-ui/react";
import React from "react";

interface TwoFAProps {
  viewTwoFA: boolean;
}

const TwoFA: React.FC<TwoFAProps> = ({ viewTwoFA }) => {
  return (
    <Box display={viewTwoFA ? "block" : "none"}>
      <Text>We have sent you an email with a 4-digit pin code</Text>
      <Text>Enter the pin code below:</Text>
      <form>
        <Input placeholder="Pin code" />
        <Button>Submit</Button>
      </form>
    </Box>
  );
};

export default TwoFA;
