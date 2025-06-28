import React, { useState, useEffect, useRef } from "react";
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
  Car,
  Loader2,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {
  const { user: authUser, loading, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [heartHover, setHeartHover] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [error, setError] = useState('');
  
  const debounceTimeout = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Debounced function to fetch Gemini AI suggestions
  const fetchSuggestion = async (query) => {
    if (query.trim().length < 2) {
      setSuggestion('');
      setShowSuggestion(false);
      return;
    }

    setIsLoadingSuggestion(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/autocomplete`,
        { prompt: query.trim() },
        {
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data.success && response.data.suggestion) {
        setSuggestion(response.data.suggestion);
        setShowSuggestion(true);
      } else {
        setSuggestion('');
        setShowSuggestion(false);
      }
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      
      // Handle different error types
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment.');
      } else if (error.response?.status >= 500) {
        setError('Service temporarily unavailable.');
      } else {
        setError('Unable to load suggestions.');
      }
      
      setSuggestion('');
      setShowSuggestion(false);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Hide suggestion immediately if input is too short
    if (value.trim().length < 2) {
      setSuggestion('');
      setShowSuggestion(false);
      setError('');
      return;
    }

    // Set new timeout for API call
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestion(value);
    }, 500); // 500ms delay
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setShowSuggestion(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = () => {
    if (suggestion) {
      setSearchTerm(suggestion);
      setShowSuggestion(false);
      navigate(`/browse?search=${encodeURIComponent(suggestion)}`);
      setSearchTerm("");
    }
  };

  // Handle click outside to hide suggestion
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestion(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setAccountOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
            <Link to="/browse" className="text-[#001F3F] hover:text-orange-600 font-medium transition-colors duration-200">
              Browse Cars
            </Link>
            {authUser && (authUser.role === 'seller' || authUser.role === 'admin') && (
              <Link to="/sellCar" className="text-[#001F3F] hover:text-orange-600 font-medium transition-colors duration-200">
                Sell a Car
              </Link>
            )}
            {authUser && (
              <>
                <Link to="/orders" className="text-[#001F3F] hover:text-orange-600 font-medium transition-colors duration-200">
                  Orders
                </Link>
                <Link to="/messaging" className="text-[#001F3F] hover:text-orange-600 font-medium transition-colors duration-200">
                  Messages
                </Link>
              </>
            )}
          </div>

          {/* AI-Powered Search */}
          <div className="hidden md:flex items-center relative" ref={searchInputRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                placeholder="Search cars... (Gemini AI-powered)"
                value={searchTerm}
                onChange={handleInputChange}
                className="w-64 pl-4 pr-10 py-2 rounded-md border bg-[#F6F7FA] focus:ring-2 focus:ring-[#1EAEDB] transition"
                style={{ fontFamily: "inherit" }}
              />
              
              {/* Loading indicator */}
              {isLoadingSuggestion && (
                <div className="absolute right-10 top-2.5">
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                </div>
              )}
              
              <button 
                type="submit"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>

            {/* AI Suggestion Dropdown */}
            {showSuggestion && suggestion && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div 
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 flex items-center gap-2"
                  onClick={handleSuggestionClick}
                >
                  <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <div className="flex-grow">
                    <div className="text-xs text-gray-600 mb-1">Gemini AI Suggestion:</div>
                    <div className="text-gray-900 font-medium text-sm">{suggestion}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-3">
                  <div className="text-xs text-red-600">{error}</div>
                </div>
              </div>
            )}
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
                    alt={`${authUser.firstName?.split(" ")[0] || ""} ${authUser.lastName?.split(" ")[0] || ""}`}
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