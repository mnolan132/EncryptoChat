import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Profile from "./components/Profile";
import NotFound from "./components/NotFound";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
};

export default App;
