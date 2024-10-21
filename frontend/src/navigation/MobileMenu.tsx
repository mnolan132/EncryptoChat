import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useDisclosure,
  Text,
  Box,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

interface MobileMenuProps {
  handleLogOut: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ handleLogOut }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box display={{ base: "flex", lg: "none" }}>
      <Button
        background={"#3C4565 "}
        textColor={"#FFFFFF"}
        onClick={onOpen}
        alignSelf={"flex-start"}
        m={"10px"}
      >
        <HamburgerIcon />
      </Button>
      <Drawer placement={"left"} onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent background={"#3C4565"}>
          <DrawerHeader>
            <DrawerCloseButton m={"3px"} textColor={"#FFFFFF"} />
          </DrawerHeader>
          <DrawerBody textColor={"#FFFFFF"} mt={"20px"}>
            <Box
              display={"flex"}
              flexDir={"column"}
              justifyContent={"space-between"}
            >
              <Box>
                <Link to="/profile" onClick={onClose}>
                  <Text fontWeight={"medium"} fontSize={"2xl"} py={"10px"}>
                    Profile
                  </Text>
                </Link>
                <Link to="/messages" onClick={onClose}>
                  <Text fontWeight={"medium"} fontSize={"2xl"} py={"10px"}>
                    Messages
                  </Text>
                </Link>
                <Link to="/contacts" onClick={onClose}>
                  <Text fontWeight={"medium"} fontSize={"2xl"} py={"10px"}>
                    Contacts
                  </Text>
                </Link>
              </Box>
              <Button onClick={handleLogOut}>Log Out</Button>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default MobileMenu;
