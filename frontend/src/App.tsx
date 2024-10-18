<<<<<<< Updated upstream
import { Box, ChakraProvider } from "@chakra-ui/react";
import { useState, useEffect } from "react";
=======
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import { useState } from "react";
>>>>>>> Stashed changes
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Validate from "./validateUser/Validate";
import "./App.css";
import Nav from "./navigation/Nav";
import ContactsPage from "./contact/Contact";
<<<<<<< Updated upstream
import Conversations from "./messages/Conversations";
=======
import Messages from "./messages/Messages";
import ProfilePage from "./profile/Profile";
>>>>>>> Stashed changes

type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");

    if (loggedIn && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser)); // Restore the user state
    }
  }, []);

  return (
    <ChakraProvider>
      {/* <Box height={"100vh"}> */}
        <Router>
<<<<<<< Updated upstream
          <Nav
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
          />
          <Validate
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
            user={user}
          />
          <Box mt={"60px"} pl={{ base: "0px", lg: "73px" }} w={"100vw"}>
            <Routes>
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/messages" element={<Conversations user={user} />} />
            </Routes>
          </Box>
=======
        <Flex 
         direction="column"
         minH="100vh" // Ensure full viewport height
         minW="100vw" // Ensure full viewport width
         overflow="hidden" // Prevent overflow issues
         background="#f0f0f0"
        >
          <Nav isLoggedIn={isLoggedIn} />
            <Validate
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
              user={user}
            />
            <Flex 
              as={Box} 
              flex="1" 
              mt="60px" 
              ml={{ base: "0px", lg: "73px" }} 
              align="center" 
              justify="center" 
              width="100%" // Full width
              height="100%" // Full height of the remaining space
              padding={4} 
            >
            {/* <Box mt={"60px"} ml={{ base: "0px", lg: "73px" }} background={"red"}> */}
              <Routes>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/messages" element={<Messages user={user} />} />
              </Routes>
            {/* </Box> */}
            </Flex>
          </Flex>
>>>>>>> Stashed changes
        </Router>
      
      {/* </Box> */}
    </ChakraProvider>
  );
}

export default App;
