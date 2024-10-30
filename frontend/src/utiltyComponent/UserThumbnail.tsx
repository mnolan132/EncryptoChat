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

  const backgroundColorsArray = [
    "#7cf494",
    "#6f97e2",
    "#f7b2bc",
    "#f9d8a7",
    "#d8f796",
    "#998bf4",
    "#ddb8f9",
    "#fcc2e5",
    "#e8ffb2",
  ];

  const randomBackgroundColor = (backgroundColorsArray: string[]) => {
    const randomIndex = Math.floor(
      Math.random() * backgroundColorsArray.length
    );
    return backgroundColorsArray[randomIndex];
  };

  const backgroundColor = randomBackgroundColor(backgroundColorsArray);

  return (
    <Flex
      width={diameter}
      height={diameter}
      borderRadius="full"
      bg={backgroundColor}
      align="center"
      justify="center"
      fontSize={fontSize}
      fontWeight="bold"
      color="black"
      opacity={"0.2"}
    >
      {getInitials(firstName || "", lastName || "")}
    </Flex>
  );
};

export default UserThumbnail;
