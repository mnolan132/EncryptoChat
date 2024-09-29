import Login from "./Login";
import Signup from "./Signup";
import { useState } from "react";
import logo from "../assets/logo.png";
import { Box, Image } from "@chakra-ui/react";

interface ValidateProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Validate: React.FC<ValidateProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const [selectSignup, setSelectSignup] = useState(false);
  const [show, setShow] = useState(false);

  const handleSelectSignup = () => {
    setSelectSignup(!selectSignup);
  };

  const showPassword = () => setShow(!show);

  console.log("isLoggedIn:", isLoggedIn); // This will log the value of isLoggedIn every time the component renders

  return (
    <Box
      display={isLoggedIn ? "none" : "flex"}
      flexDir={{ base: "column", lg: "row" }}
      alignItems={"center"}
      justifyContent={{ base: "middle", lg: "center" }}
      height={"100vh"}
      w={"100vw"}
      m={"0 auto"}
    >
      <Image
        src={logo}
        boxSize={{ base: "300px", md: "400px", lg: "550px" }}
        my={selectSignup ? "-30px" : "0px"}
      />
      <Login
        handleSelectSignup={handleSelectSignup}
        showPassword={showPassword}
        show={show}
        selectSignup={selectSignup}
        setIsLoggedIn={setIsLoggedIn}
      />
      <Signup
        handleSelectSignup={handleSelectSignup}
        showPassword={showPassword}
        show={show}
        selectSignup={selectSignup}
      />
    </Box>
  );
};

export default Validate;
