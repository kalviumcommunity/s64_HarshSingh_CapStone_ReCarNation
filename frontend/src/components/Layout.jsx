import React from 'react';
import Header from './Header';
import Footer from './footer';
import AIAssistantWidget from './AIAssistantWidget';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <AIAssistantWidget />
      <Footer />
    </div>
  );
};

export default Layout; 