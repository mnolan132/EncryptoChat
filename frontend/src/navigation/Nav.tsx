import { Box } from "@chakra-ui/react";
import MobileMenu from "./MobileMenu";

interface NavProps {
  isLoggedIn: boolean;
}

const Nav: React.FC<NavProps> = ({ isLoggedIn }) => {
  return (
    <Box
      width={"100%"}
      position={"absolute"}
      height={"60px"}
      backgroundColor={"#3C4565"}
      display={isLoggedIn ? "flex" : "none"}
      justifyContent={"flex-start"}
      alignItems={"center"}
    >
      <MobileMenu />
    </Box>
  );
};

export default Nav;
