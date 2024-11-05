import { Box, Icon, Text, Button, useDisclosure } from "@chakra-ui/react";
import MobileMenu from "./MobileMenu";
import { ImProfile } from "react-icons/im";
import { HamburgerIcon, ChatIcon } from "@chakra-ui/icons";
import { RiContactsFill } from "react-icons/ri";
import { BiMessageEdit } from "react-icons/bi";

import { useState } from "react";
import { Link } from "react-router-dom";
import NewMessage from "../messages/NewMessage";
import ToggleDarkMode from "../utiltyComponent/ToggleDarkMode";

type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
};

interface Contact {
  id: string;
  firstName: string;
  email: string;
  lastName: string;
}

interface NavProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: (value: React.SetStateAction<User | null>) => void;
  contacts: Contact[] | null; // Allow contacts to be null or an array
  user: User | null;
  toggleDarkMode: () => void;
  darkMode: boolean;
}

const Nav: React.FC<NavProps> = ({
  isLoggedIn,
  setIsLoggedIn,
  setUser,
  contacts,
  user,
  toggleDarkMode,
  darkMode,
}) => {
  const [expandMenu, setExpandMenu] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toggleMenu = () => {
    setExpandMenu(!expandMenu);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
  };

  return (
    <Box display={isLoggedIn ? "flex" : "none"}>
      <Box
        width={"100%"}
        position={"absolute"}
        height={"60px"}
        backgroundColor={"#3C4565"}
        justifyContent={"space-between"}
        alignItems={"center"}
        display={"flex"}
      >
        <Box>
          <MobileMenu
            handleLogOut={handleLogout}
            contacts={contacts}
            user={user}
          />
        </Box>
        <Box>
          <ToggleDarkMode toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        </Box>
      </Box>
      <Box
        height={"100vh"}
        backgroundColor={"#3c4565"}
        position={"absolute"}
        color={"#ffffff"}
        display={{ base: "none", lg: "block" }}
        minW={expandMenu ? "250px" : 0}
        zIndex={3}
      >
        <Box height={"50px"} m={"10px"} position={"fixed"}>
          <Button
            background={"#3C4565 "}
            textColor={"#FFFFFF"}
            onClick={toggleMenu}
            alignSelf={"flex-start"}
          >
            <HamburgerIcon />
          </Button>
        </Box>
        <Box
          display={"flex"}
          flexDir={"column"}
          justifyContent={"space-between"}
        >
          <Box mt={"60px"} display={"flex"} flexDir={"column"}>
            <Button
              bg={"#0CCEC2"}
              height={"50px"}
              my={"10px"}
              display={expandMenu ? "flex" : "block"}
              onClick={onOpen}
              mx={"3px"}
            >
              <Icon
                as={BiMessageEdit}
                height={"30px"}
                width={"30px"}
                mx={expandMenu ? "12px" : 0}
              />
              <Text
                display={expandMenu ? "block" : "none"}
                fontSize={expandMenu ? "medium" : "xs"}
                mx={expandMenu ? "10px" : 0}
              >
                New Message
              </Text>
            </Button>
            <NewMessage
              isOpen={isOpen}
              onClose={onClose}
              contacts={contacts}
              currentUserId={user?.id}
            />
            <Link to="/profile">
              <Box
                height={expandMenu ? "50px" : "65px"}
                m={"10px"}
                display={expandMenu ? "flex" : "block"}
              >
                <Icon
                  as={ImProfile}
                  height={"30px"}
                  width={"30px"}
                  mx={expandMenu ? "12px" : 0}
                />
                <Text
                  fontSize={expandMenu ? "medium" : "xs"}
                  mx={expandMenu ? "10px" : 0}
                >
                  Profile
                </Text>
              </Box>
            </Link>
            <Link to="/messages">
              <Box
                height={expandMenu ? "50px" : "65px"}
                m={"10px"}
                display={expandMenu ? "flex" : "block"}
              >
                <ChatIcon h={"30px"} w={"30px"} mx={expandMenu ? "12px" : 0} />
                <Text
                  fontSize={expandMenu ? "medium" : "xs"}
                  mx={expandMenu ? "10px" : 0}
                >
                  Messages
                </Text>
              </Box>
            </Link>
            <Link to="/contacts">
              <Box
                height={expandMenu ? "50px" : "65px"}
                m={"10px"}
                display={expandMenu ? "flex" : "block"}
              >
                <Icon
                  as={RiContactsFill}
                  height={"30px"}
                  width={"30px"}
                  mx={expandMenu ? "12px" : 0}
                />
                <Text
                  fontSize={expandMenu ? "medium" : "xs"}
                  mx={expandMenu ? "10px" : 0}
                >
                  Contacts
                </Text>
              </Box>
            </Link>
          </Box>
          <Button
            display={expandMenu ? "block" : "none"}
            onClick={handleLogout}
            mx={"5px"}
          >
            Log Out
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Nav;
