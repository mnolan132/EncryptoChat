import Login from "./Login";
import Signup from "./Signup";
import { useState } from "react";
import logo from "../assets/logo.png";
import { Box, Image } from "@chakra-ui/react";

const Validate = () => {
  const [selectSignup, setSelectSignup] = useState(false);
  const [show, setShow] = useState(false);

  const handleSelectSignup = () => {
    setSelectSignup(!selectSignup);
  };

  const showPassword = () => setShow(!show);
  return (
    <Box display="flex" flexDir={"column"} alignItems={"center"}>
      <Image src={logo} boxSize={"300px"} my={selectSignup ? "-70px" : "0px"} />
      <Login
        handleSelectSignup={handleSelectSignup}
        showPassword={showPassword}
        show={show}
        selectSignup={selectSignup}
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
