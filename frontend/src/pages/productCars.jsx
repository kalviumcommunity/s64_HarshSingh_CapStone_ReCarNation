import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, MapPin, Calendar } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }
        const data = await response.json();
        setCars(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleDetailsClick = (carId) => {
    navigate(`/car/${carId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Cars</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <Card key={car._id} className="hover:shadow-lg transition-shadow">
            <div className="p-0">
              <img
                src={car.images[0]}
                alt={car.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">{car.title}</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{car.year}</span>
                </div>
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  <span>{car.mileage.toLocaleString()} miles</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{car.location}</span>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  ${car.price.toLocaleString()}
                </div>
              </div>
            </CardContent>
            <div className="p-4">
              <Button
                onClick={() => handleDetailsClick(car._id)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductCars; 