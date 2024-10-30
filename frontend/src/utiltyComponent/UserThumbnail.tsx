import { Flex } from "@chakra-ui/react";
import React from "react";

interface UserThumbnailProps {
  firstName: string;
  lastName: string;
  diameter: string;
  fontSize: string;
}

const UserThumbnail: React.FC<UserThumbnailProps> = ({
  firstName,
  lastName,
  diameter,
  fontSize,
}) => {
  //Get the first letter from both firstName and lastName
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  return (
    <Flex
      width={diameter}
      height={diameter}
      borderRadius="full"
      bg="gray.300"
      align="center"
      justify="center"
      fontSize={fontSize}
      fontWeight="bold"
      color="white"
    >
      {getInitials(firstName || "", lastName || "")}
    </Flex>
  );
};

export default UserThumbnail;
