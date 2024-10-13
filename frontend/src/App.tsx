import { Box, ChakraProvider } from "@chakra-ui/react";
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Validate from "./validateUser/Validate";
import "./App.css";
import Nav from "./navigation/Nav";
import ContactsPage from "./contact/Contact";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <ChakraProvider>
      <Box height={"100vh"}>
        <Router>
          <Nav isLoggedIn={isLoggedIn} />
          <Validate isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <Routes>
            <Route path="/contacts" element={<ContactsPage />}/>
          </Routes>
        </Router>
      </Box>
    </ChakraProvider>
  );
}

export default App;
