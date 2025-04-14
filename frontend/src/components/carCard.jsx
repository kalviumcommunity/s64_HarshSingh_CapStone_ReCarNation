import React from 'react';

const CarCard = ({ car }) => {
  return (
    <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg border p-4">
      <img className="w-full h-48 object-cover" src={car.image} alt={car.title} />
      <div className="px-2 py-3">
        <h2 className="text-lg font-semibold">
          {car.title} <span className="text-gray-500">{car.variant}</span>
        </h2>
        <div className="flex flex-wrap gap-2 text-sm text-gray-700 mt-2">
          <span>{car.kmDriven}</span>
          <span>{car.fuelType}</span>
          <span>{car.transmission}</span>
          <span>{car.owner}</span>
        </div>
        <div className="text-xl font-bold text-green-700 mt-3">₹{car.price} lakh</div>
        <div className="text-gray-500 text-sm mt-1">{car.location}</div>
      </div>
    </div>
  );
};

export default CarCard;
