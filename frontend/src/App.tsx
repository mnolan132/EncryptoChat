import { Box, ChakraProvider } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Validate from "./validateUser/Validate";
import "./App.css";
import Nav from "./navigation/Nav";
import ContactsPage from "./contact/Contact";
import Conversations from "./messages/Conversations";

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
      <Box height={"100vh"} backgroundColor={"ffffff"}>
        <Router>
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
          <Box
            mt={"60px"}
            pl={{ base: "0px", lg: "73px" }}
            w={"100vw"}
            height={`calc(100vh - 60px)`}
          >
            <Routes>
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/messages" element={<Conversations user={user} />} />
            </Routes>
          </Box>
        </Router>
      </Box>
    </ChakraProvider>
  );
}

export default App;
