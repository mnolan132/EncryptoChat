import { Box, Icon, Text, Button } from "@chakra-ui/react";
import MobileMenu from "./MobileMenu";
import { ImProfile } from "react-icons/im";
import { HamburgerIcon, ChatIcon } from "@chakra-ui/icons";
import { RiContactsFill } from "react-icons/ri";
import { useState } from "react";
import { Link } from "react-router-dom";

interface NavProps {
  isLoggedIn: boolean;
}

const Nav: React.FC<NavProps> = ({ isLoggedIn }) => {
  const [expandMenu, setExpandMenu] = useState(false);

  const toggleMenu = () => {
    setExpandMenu(!expandMenu);
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
        <MobileMenu />
      </Box>
      <Box
        height={"100vh"}
        backgroundColor={"#3c4565"}
        position={"absolute"}
        color={"#ffffff"}
        display={{ base: "none", lg: "block" }}
        minW={expandMenu ? "250px" : 0}
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
        <Box mt={"60px"}>
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
      </Box>
    </Box>
  );
};

export default Nav;
