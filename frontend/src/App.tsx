import { Box, ChakraProvider } from "@chakra-ui/react";
import { useState } from "react";
import Validate from "./validateUser/Validate";
import "./App.css";
import Nav from "./navigation/Nav";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <ChakraProvider>
      <Box height={"100vh"}>
        <Nav isLoggedIn={isLoggedIn} />
        <Validate isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      </Box>
    </ChakraProvider>
  );
}

export default App;
