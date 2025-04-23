import React, { useState, useEffect, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Calendar, Fuel, BarChart3, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

// PropTypes are defined in comments for documentation
/**
 * @typedef {Object} Product
 * @property {string} _id
 * @property {string} name
 * @property {string} company
 * @property {string} model
 * @property {number} year
 * @property {string} description
 * @property {number} KilometersTraveled
 * @property {string} listedBy
 * @property {string} image
 * @property {string} location
 * @property {number} price
 * @property {string} fuelType
 * @property {boolean} isFeatured
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CarCardProps
 * @property {Product} product
 */

/**
 * @typedef {Object} CarListingContainerProps
 * @property {boolean} [featuredOnly]
 * @property {number} [limit]
 */

// API base URL - should be moved to an environment variable
const API_BASE_URL = 'http://localhost:3000/api';

// Memoized car card component for better performance
const CarCard = memo(({ product }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get user token from localStorage
  const token = localStorage.getItem('token');

  // Check if car is in favorites on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user/favorites`,
          { 
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data && Array.isArray(response.data.favorites)) {
          const isFav = response.data.favorites.some(fav => fav._id === product._id);
          setIsFavorite(isFav);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    
    checkFavoriteStatus();
  }, [product._id, token]);

  // Memoize image URL calculation
  const imageUrl = React.useMemo(() => {
    return product.image 
      ? `${API_BASE_URL}/uploads/${product.image}` 
      : "https://via.placeholder.com/400x300?text=No+Image+Available";
  }, [product.image]);

  const handleFavoriteClick = async () => {
    if (!token) {
      // Redirect to login or show login modal
      alert('Please log in to save favorites');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(
          `${API_BASE_URL}/user/favorites/${product._id}`,
          { 
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        // Add to favorites
        await axios.post(
          `${API_BASE_URL}/user/favorites`,
          { productId: product._id },
          { 
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${product.company} ${product.model}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-orange-600 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
            Featured
          </Badge>
        )}
        <button 
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className={`absolute top-2 left-2 p-1.5 rounded-full ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
          } hover:bg-red-500 hover:text-white transition-colors duration-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-sm font-semibold truncate text-gray-800 hover:text-blue-900 transition-colors duration-200 max-w-[70%]">
            {product.company} {product.model}
          </h3>
          <span className="text-xs font-bold text-orange-600">
            ₹{product.price?.toLocaleString() || 'Contact'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-[11px] truncate">{product.year}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-[11px] truncate">{product.location || 'Not specified'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <BarChart3 className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-[11px] truncate">{product.KilometersTraveled?.toLocaleString() || "N/A"} km</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Fuel className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-[11px] truncate">{product.fuelType || 'Not specified'}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-[0.4] h-7 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white transition-colors duration-300 text-[10px] py-0"
            asChild
          >
            <Link to={`/car/${product._id}`}>
              <Car className="h-3 w-3 mr-1" />
              Details
            </Link>
          </Button>
          <Button 
            className="flex-[0.6] h-7 bg-orange-600 hover:bg-orange-500 text-white transition-colors duration-300 text-xs py-0 font-medium"
            asChild
          >
            <Link to={`/messaging/${product._id}`}>
              Contact Seller
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
});

CarCard.displayName = 'CarCard';

// Optimized container component with error boundaries and loading states
const CarListingContainer = memo(({ 
  featuredOnly = false, 
  limit = 0 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (featuredOnly) params.append('featured', 'true');
        if (limit > 0) params.append('limit', limit.toString());
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await axios.get(
          `${API_BASE_URL}/products${queryString}`,
          {
            withCredentials: true,
            signal: controller.signal
          }
        );
        
        if (response.data?.products) {
          setProducts(response.data.products);
        }
      } catch (err) {
        if (axios.isCancel && axios.isCancel(err)) {
          // Request was cancelled, ignore
          return;
        }
        console.error('Error fetching products:', err);
        setError('Failed to load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [featuredOnly, limit]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-300 mb-4"></div>
          <div className="h-4 w-24 bg-gray-300 rounded mb-3"></div>
          <div className="h-2 w-36 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        {error}
        <button 
          onClick={() => setError(null)}
          className="block mx-auto mt-4 text-blue-600 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No vehicles found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <CarCard key={product._id} product={product} />
      ))}
    </div>
  );
});

CarListingContainer.displayName = 'CarListingContainer';

export { CarCard, CarListingContainer };
export default CarListingContainer;