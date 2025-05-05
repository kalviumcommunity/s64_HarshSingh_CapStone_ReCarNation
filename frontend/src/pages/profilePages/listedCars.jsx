import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { CarCard } from '@/components/productCards';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ListedCars = () => {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Debug log
        console.log('Fetching cars for user:', user?._id);
        
        const endpoint = user?.role === 'admin' ? '/api/products/admin/all' : '/api/products/mine';
        const response = await axios.get(`http://localhost:3000${endpoint}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Debug log
        console.log('API Response:', response.data);
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

        setCars(response.data);
      } catch (err) {
        console.error('Error fetching cars:', err.response || err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load cars';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCars();
    }
  }, [user]);

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/products/${carId}`, {
        withCredentials: true
      });
      setCars(cars.filter(car => car._id !== carId));
      toast.success('Listing deleted successfully');
    } catch (err) {
      console.error('Error deleting car:', err.response || err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete listing';
      toast.error(errorMessage);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please log in to view your listings</p>
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === 'admin' ? 'All Listed Cars' : 'My Listed Cars'}
        </h1>
        {user.role === 'seller' && (
          <Link to="/sellCar">
            <Button className="bg-orange-600 hover:bg-orange-500 text-white">
              <Car className="h-4 w-4 mr-2" />
              List New Car
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-600 hover:bg-orange-500 text-white"
          >
            Try Again
          </Button>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Cars Listed</h2>
          <p className="text-gray-600 mb-6">
            {user.role === 'admin'
              ? "There are no cars listed in the system yet."
              : "You haven't listed any cars yet."}
          </p>
          {user.role === 'seller' && (
            <Link to="/sellCar">
              <Button className="bg-orange-600 hover:bg-orange-500 text-white">
                List Your First Car
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarCard 
              key={car._id} 
              product={car}
              onDelete={handleDelete}
              currentUserIsOwner={user._id === car.listedBy || user.role === 'admin'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListedCars;