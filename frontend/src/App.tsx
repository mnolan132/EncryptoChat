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
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<null | User>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const toast = useToast();

  const fetchContacts = async () => {
    console.log("Fetching contacts....");
    try {
      const response = await fetch(
        `https://encrypto-chat-theta.vercel.app/contacts/getContacts/${user?.id}`
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

  const checkDarkMode = () => {
    if (
      window &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }
  };

  // This function toggles darkmode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");
    checkDarkMode();
    if (loggedIn && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser)); // Restore the user state
      fetchContacts();
    }
  }, []);

  // Global styles
  const bgColor = darkMode ? "#404258" : "#FBFAF5";
  const textColor = darkMode ? "whitesmoke" : "#404258";

  return (
    <ChakraProvider>
      <Box height={"100vh"} backgroundColor={bgColor} textColor={textColor}>
        <Router>
          <Nav
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
            contacts={contacts}
            user={user}
            toggleDarkMode={toggleDarkMode}
            darkMode={darkMode}
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
              <Route
                path="/messages"
                element={<Conversations user={user} darkMode={darkMode} />}
              />
              <Route
                path="/profile"
                element={<ProfilePage user={user} darkMode={darkMode} />}
              />
            </Routes>
          </Box>
        </Router>
      </Box>
    </ChakraProvider>
  );
}

export default App;
