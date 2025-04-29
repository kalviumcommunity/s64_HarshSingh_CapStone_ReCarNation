import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWishlist(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch wishlist");
        setLoading(false);
      }
    };

    if (token) {
      fetchWishlist();
    }
  }, [token]);

  const removeFromWishlist = async (carId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/wishlist/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWishlist(wishlist.filter((item) => item._id !== carId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove from wishlist");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please login to view your wishlist</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't added any cars to your wishlist yet.
          </p>
          <Link
            to="/browse"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Browse Cars
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((car) => (
            <div
              key={car._id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="relative">
                <img
                  src={car.images[0] || "https://via.placeholder.com/300x200"}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(car._id)}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">
                  {car.make} {car.model}
                </h3>
                <p className="text-gray-600 mb-2">{car.year}</p>
                <p className="text-xl font-bold text-blue-600">
                  ${car.price.toLocaleString()}
                </p>
                <div className="mt-4">
                  <Link
                    to={`/car/${car._id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 