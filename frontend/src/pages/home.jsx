// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import CarCard from '../components/carCard';

const Home = () => {
  const [cars, setCars] = useState([
    // Sample car data for testing UI until backend is ready

  useEffect(() => {
    axios.get('http://localhost:3000/api/products')
      .then(res => setCars(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {cars.map(car => (
        <CarCard key={car._id} car={car} />
      ))}
    </div>
  );
};

export default Home;
