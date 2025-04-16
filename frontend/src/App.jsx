import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductCard from './components/carCard';

function App() {
  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <header className="bg-white shadow-sm py-3">
          <div className="container">
            <h1 className="text-center fs-2 fw-bold">Used Car Marketplace</h1>
          </div>
        </header>
        
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<ProductCard />} />
            {/* Add more routes like /edit/:id or /create if needed */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;