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

const MobileMenu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box display={{ base: "flex", lg: "none" }}>
      <Button
        background={"#3C4565 "}
        textColor={"#FFFFFF"}
        onClick={onOpen}
        alignSelf={"flex-start"}
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
            <Text fontWeight={"medium"} fontSize={"2xl"} py={"10px"}>
              Profile
            </Text>
            <Text fontWeight={"medium"} fontSize={"2xl"} py={"10px"}>
              Messages
            </Text>
            <Link to="/contacts" onClick={onClose}>
              <Text fontWeight={"medium"} fontSize={"2xl"} py={"10px"}>
                Contacts
              </Text>
            </Link>
            
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default MobileMenu;
