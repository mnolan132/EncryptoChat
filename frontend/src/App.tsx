import { Box, ChakraProvider, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Validate from "./validateUser/Validate";
import "./App.css";
import Nav from "./navigation/Nav";
import ContactsPage from "./contact/Contact";
import Conversations from "./messages/Conversations";
import ProfilePage from "./profile/Profile";

type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<null | User>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const toast = useToast();

  const fetchContacts = async () => {
    console.log("Fetching contacts....");
    try {
      const response = await fetch(
        `http://localhost:5001/contacts/getContacts/${user?.id}`
      );
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Error fetching contacts", error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");

    if (loggedIn && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser)); // Restore the user state
      fetchContacts();
    }
  }, []);

  return (
    <ChakraProvider>
      <Box height={"100vh"}>
        <Router>
          <Nav
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
            contacts={contacts}
            user={user}
          />
          <Validate
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
            user={user}
          />
          <Box mt={"60px"} pl={{ base: "0px", lg: "73px" }} w={"100vw"}>
            <Routes>
              <Route path="/contacts" element={<ContactsPage user={user} />} />
              <Route path="/messages" element={<Conversations user={user} />} />
              <Route path="/profile" element={<ProfilePage user={user} />} />
            </Routes>
          </Box>
        </Router>
      </Box>
    </ChakraProvider>
  );
}

export default App;
