import { Box } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

interface ToggleDarkModeProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

const ToggleDarkMode: React.FC<ToggleDarkModeProps> = ({
  toggleDarkMode,
  darkMode,
}) => {
  return (
    <Box>
      <Box
        cursor={"pointer"}
        right={"auto"}
        display={"flex"}
        padding={"10px"}
        h={"30px"}
        w={"30px"}
        m={"10px"}
        borderRadius="100"
        onClick={toggleDarkMode}
        background={darkMode ? "whitesmoke" : "#404258"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        {darkMode ? (
          <SunIcon color="#404258" />
        ) : (
          <MoonIcon color="whitesmoke" />
        )}
      </Box>
    </Box>
  );
};

export default ToggleDarkMode;
