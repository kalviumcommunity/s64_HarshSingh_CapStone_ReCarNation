import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  MessageSquare,
  ShoppingCart,
  Heart,
  Menu,
  ChevronDown,
  LogOut,
  Car
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

// Just for demo: replace with actual login state and user data
const isLoggedIn = false;
const user = {
  firstName: "Alex",
  photo: "https://randomuser.me/api/portraits/men/32.jpg",
};
// For wishlist, simulate 1+ items triggers a filled heart
const wishlistCount = 0;

const Navbar = () => {
  const { user: authUser, loading, logout } = useContext(AuthContext);
  const [accountOpen, setAccountOpen] = useState(false);
  // Tooltip on heart
  const [heartHover, setHeartHover] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Car className="h-7 w-7 text-orange-500 mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
              ReCarNation
            </span>
          </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link to="/listings" className="text-[#001F3F] hover:text-[#1EAEDB] font-medium transition-colors duration-200">
              Browse Cars
            </Link>
            <Link to="/sellCar" className="text-[#001F3F] hover:text-[#1EAEDB] font-medium transition-colors duration-200">
              Sell a Car
            </Link>
            <Link to="/orders" className="text-[#001F3F] hover:text-[#1EAEDB] font-medium transition-colors duration-200">
              Orders
            </Link>
            <Link to="/messaging" className="text-[#001F3F] hover:text-[#1EAEDB] font-medium transition-colors duration-200">
              Messages
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="w-56 pl-4 pr-10 py-2 rounded-md border bg-[#F6F7FA] focus:ring-2 focus:ring-[#1EAEDB] transition"
                style={{ fontFamily: "inherit" }}
              />
              <Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 md:gap-3 ml-2 relative">
            {/* Wishlist Heart */}
            <Link
              to="/wishlist"
              className="relative group"
              onMouseEnter={() => setHeartHover(true)}
              onMouseLeave={() => setHeartHover(false)}
              aria-label="Your Wishlist"
            >
              <span
                className="rounded-full p-2 hover:bg-gray-100 transition-transform duration-100 inline-flex items-center active:scale-95"
                style={{ transition: "transform 0.12s" }}
              >
                  <Heart className="text-[#001F3F]" size={22} />
              </span>
              {/* Tooltip */}
              {(heartHover) && (
                <span className="absolute left-1/2 -translate-x-1/2 top-11 whitespace-nowrap bg-black text-white text-xs rounded px-2 py-1 z-20 shadow animate-fadeIn min-w-max">
                  Your Wishlist
                </span>
              )}
            </Link>
            {/* Divider */}
            <span className="hidden md:inline-block w-px h-7 bg-[#E6E8EB] mx-2"></span>

            {/* Profile area */}
            <div className="relative select-none">
              <button
                className="flex items-center gap-2 md:px-2 py-1 rounded-full bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1EAEDB] transition-transform duration-100 active:scale-95"
                onClick={() => setAccountOpen((s) => !s)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                style={{ minWidth: 44 }}
              >
                {/* Avatar or Icon */}
                {authUser ? (
                  <img
                    src={authUser.photo || "https://via.placeholder.com/32"}
                    alt={authUser.firstName}
                    className="h-8 w-8 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <span className="flex-shrink-0 bg-[#001F3F] rounded-full h-8 w-8 flex items-center justify-center">
                    <User className="text-white" size={20} />
                  </span>
                )}
                {/* Text */}
                <div className="hidden md:flex md:flex-col items-start mr-2">
                  <span className="text-xs text-gray-500 leading-tight">
                    {authUser ? `Hello, ${authUser.firstName}` : "Hello, Sign in"}
                  </span>
                  <span className="text-sm font-bold text-black flex items-center">
                    Account
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
                  </span>
                </div>
                {/* Text for mobile */}
                <span className="md:hidden text-sm font-bold text-black flex items-center">
                  <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
                </span>
              </button>
              {/* Dropdown menu */}
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-50 animate-fadeIn">
                  {authUser ? (
                    <React.Fragment>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-[#001F3F] hover:bg-gray-100 transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-[#001F3F] hover:bg-gray-100 transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        Orders
                      </Link>
                      <button
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-[#001F3F] hover:bg-gray-100 transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-[#001F3F] hover:bg-gray-100 transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-[#001F3F] hover:bg-gray-100 transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        Register
                      </Link>
                    </React.Fragment>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hamburger Menu: only on mobile */}
          <button className="flex md:hidden items-center ml-2 p-2 focus:outline-none hover:bg-gray-100 rounded transition"
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7 text-[#001F3F]" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;