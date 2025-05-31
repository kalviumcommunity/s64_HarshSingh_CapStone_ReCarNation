import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CarCard } from '@/components/productCards';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
        withCredentials: true
      });
      
      const processedItems = response.data.map(item => {
        const productData = item.productId;
        if (!productData) return null;
        
        return {
          ...productData,
          inWishlist: true // Mark as already in wishlist
        };
      }).filter(Boolean); // Remove any null items
      
      setWishlistItems(processedItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist. Please try again.');
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}`, {
        withCredentials: true
      });
      
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 flex-grow">
          <div className="text-center py-12">
            <p className="text-gray-600">Please login to view your wishlist</p>
            <Link to="/auth" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 flex-grow">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchWishlist}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        
        {!wishlistItems || wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Your wishlist is empty</p>
            <Link to="/browse" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((product) => (
              <CarCard 
                key={product._id} 
                product={product}
                onRemoveFromWishlist={() => removeFromWishlist(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;