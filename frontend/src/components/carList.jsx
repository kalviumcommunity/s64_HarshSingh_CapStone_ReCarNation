// src/components/CarList.jsx
import React, { useEffect, useState } from 'react';
import CarCard from './carCard';

const CarList = () => {
  const [cars, setCars] = useState([
    {
      _id: '1',
      title: '2017 Maruti Baleno',
      variant: 'DELTA PETROL',
      location: 'Mansarovar, Jaipur',
      kmDriven: '53.35k km',
      fuelType: 'Petrol',
      transmission: 'Manual',
      owner: '1st owner',
      price: '4.58',
      image: 'https://example.com/baleno.png',
    },
  ]);

  // useEffect(() => {
  //   axios.get('http://localhost:5000/api/products')
  //     .then(res => setCars(res.data))
  //     .catch(err => console.error(err));
  // }, []);

  return (
    <div className="p-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {cars.map(car => (
        <CarCard key={car._id} car={car} />
      ))}
    </div>
  );
};

export default CarList;
