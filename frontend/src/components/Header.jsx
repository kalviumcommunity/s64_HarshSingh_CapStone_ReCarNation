import React from "react";
import Navbar from "./navbar";

// Header component that simply wraps the Navbar
// This allows the profile.jsx to use the "Header" import without changes
const Header = () => {
  return <Navbar />;
};

export default Header;