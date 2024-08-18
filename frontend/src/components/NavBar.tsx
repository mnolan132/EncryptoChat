import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav>
        <h1>Encryto-Chat Dasboard</h1>
        <div>
            <Link to="/">Home</Link>
            <Link to="/chat">Chat</Link>
            <Link to="/profile">Profile</Link>
        </div>
    </nav>
  )
}

export default NavBar