import { Box, Icon, Text, Button } from "@chakra-ui/react";
import MobileMenu from "./MobileMenu";
import { ImProfile } from "react-icons/im";
import { HamburgerIcon, ChatIcon } from "@chakra-ui/icons";
import { RiContactsFill } from "react-icons/ri";
import { useState } from "react";
import { Link } from "react-router-dom";

type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
};

interface NavProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: (value: React.SetStateAction<User | null>) => void;
}

const Nav: React.FC<NavProps> = ({ isLoggedIn, setIsLoggedIn, setUser }) => {
  const [expandMenu, setExpandMenu] = useState(false);

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
        justifyContent={"flex-start"}
        alignItems={"center"}
      >
        <MobileMenu handleLogOut={handleLogout} />
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
          <Box mt={"60px"}>
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
          >
            Log Out
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Nav;
