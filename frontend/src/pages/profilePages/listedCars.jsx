import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ListedCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`, {
          credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to fetch listed cars');

        const data = await res.json();
        const list = data?.products || data || [];
        setCars(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-8">Loading listed cars...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Listed Cars</h1>
      {cars.length === 0 ? (
        <p className="text-gray-600">No listed cars found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => (
            <Card key={car._id || car.id}>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">{car.title || 'Untitled car'}</h2>
                <p className="text-sm text-gray-600">{car.make} {car.model} {car.year}</p>
                <p className="text-sm font-medium">${Number(car.price || 0).toLocaleString()}</p>
                <Button variant="outline" className="w-full" disabled>
                  Manage (Coming soon)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListedCars;
