import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

const MobileMenu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <Button
        // colorScheme="blue"
        background={"#3C4565 "}
        textColor={"#FFFFFF"}
        onClick={onOpen}
        display={"flex"}
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
            <Text fontWeight={"medium"} fontSize={"2xl"} py={"10px"}>
              Contacts
            </Text>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileMenu;
