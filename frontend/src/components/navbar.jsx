import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, Car, ShoppingCart, MessageSquare, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button"; // Corrected import

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = true; // Replace this with real auth state

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Car className="h-7 w-7 text-orange-500 mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
                ReCarNation
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/listings" className="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              Browse Cars
            </Link>
            <Link to="/sell-car" className="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              Sell a Car
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/orders" className="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200">
                  <ShoppingCart className="h-4 w-4 mr-1" /> Orders
                </Link>
                <Link to="/messaging" className="text-gray-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200">
                  <MessageSquare className="h-4 w-4 mr-1" /> Messages
                </Link>
              </>
            )}
            <div className="relative text-gray-600">
              <input
                type="search"
                name="search"
                placeholder="Search..."
                className="bg-gray-50 h-9 px-5 pr-10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <button type="submit" className="absolute right-0 top-0 mt-2.5 mr-4">
                <Search className="h-4 w-4" />
              </button>
            </div>
            {isLoggedIn ? (
              <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                <Link to="/profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" /> Profile
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-400 text-white">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg rounded-b-lg">
            <Link to="/listings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50">
              Browse Cars
            </Link>
            <Link to="/sell-car" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50">
              Sell a Car
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50 flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" /> Orders
                </Link>
                <Link to="/messaging" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" /> Messages
                </Link>
              </>
            )}
            <div className="relative text-gray-600 px-3 py-2">
              <input
                type="search"
                name="search"
                placeholder="Search..."
                className="bg-gray-50 h-10 px-5 pr-10 rounded-full text-sm focus:outline-none w-full"
              />
              <button type="submit" className="absolute right-0 top-0 mt-5 mr-7">
                <Search className="h-4 w-4" />
              </button>
            </div>
            {isLoggedIn ? (
              <div className="px-3 py-2">
                <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center">
                  <Link to="/profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2 px-3 py-2">
                <Button variant="outline" className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="flex-1 bg-orange-500 hover:bg-orange-400 text-white">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
