// src/pages/Home.jsx
import React from 'react';
import CarList from '../components/carCard';

const Home = () => {
  // Component now just renders the CarList component without duplicating fetching logic
  return (
    <div>
      <CarList />
    </div>
  );
};

export default Home;