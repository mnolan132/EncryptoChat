import { ChakraProvider } from "@chakra-ui/react";

import Validate from "./validateUser/Validate";

import "./App.css";

function App() {
  return (
    <ChakraProvider>
      <Validate />
    </ChakraProvider>
  );
}

export default App;
