import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ReCarNation</h3>
            <p className="text-gray-600 text-sm">
              The best marketplace to buy and sell used cars online.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 text-sm hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cars" className="text-gray-600 text-sm hover:text-blue-600 transition-colors">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-gray-600 text-sm hover:text-blue-600 transition-colors">
                  Sell Your Car
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-600 text-sm mb-2">
              Email: info@recarnation.com
            </p>
            <p className="text-gray-600 text-sm">
              Phone: (123) 456-7890
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-600 text-sm">
            &copy; {currentYear} ReCarNation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;