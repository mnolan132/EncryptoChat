import { Box } from "@chakra-ui/react";
import MobileMenu from "./MobileMenu";

const Nav = () => {
  return (
    <Box
      width={"100%"}
      position={"absolute"}
      height={"60px"}
      backgroundColor={"#3C4565"}
      display={"flex"}
      justifyContent={"flex-start"}
      alignItems={"center"}
    >
      <MobileMenu />
    </Box>
  );
};

export default Nav;
