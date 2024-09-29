import { ChakraProvider } from "@chakra-ui/react";

import Validate from "./validateUser/Validate";
import "./App.css";
import Nav from "./navigation/Nav";

function App() {
  return (
    <ChakraProvider>
      <Nav />
      <Validate />
    </ChakraProvider>
  );
}

export default App;
