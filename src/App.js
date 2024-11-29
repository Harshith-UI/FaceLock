
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import ChatRoom from "./components/ChatRoom";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chatroom" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
