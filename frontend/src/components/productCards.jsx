import React, { useState, useEffect, memo, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Calendar, Fuel, BarChart3, Heart, Trash2, Edit } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

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
const CarCard = memo(({ product, onDelete, onRemoveFromWishlist }) => {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(product.inWishlist || false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;
  const location = useLocation();

  // Check if current user is the owner of the listing
  const currentUserIsOwner = user && product.listedBy === user._id;

  // Initialize image URL with better error handling
  useEffect(() => {
    retryCount.current = 0;
    setImageError(false);
    
    if (!product.images || product.images.length === 0) {
      setImageUrl("https://via.placeholder.com/400x300?text=No+Image+Available");
      setImageError(true);
      setIsLoading(false);
      return;
    }

    const firstImage = product.images[0];
    const url = firstImage?.url || firstImage;
    if (!url) {
      setImageUrl("https://via.placeholder.com/400x300?text=No+Image+Available");
      setImageError(true);
      setIsLoading(false);
      return;
    }

    setImageUrl(url);
  }, [product.images]);

  // Improved retry loading image function
  const retryLoadImage = useCallback(() => {
    if (retryCount.current >= MAX_RETRIES || imageError) {
      setImageUrl("https://via.placeholder.com/400x300?text=No+Image+Available");
      setImageError(true);
      return;
    }

    const nextRetry = retryCount.current + 1;
    console.log(`Retrying image load (attempt ${nextRetry}/${MAX_RETRIES})`);
    retryCount.current = nextRetry;
    
    // Add cache-busting parameter and retry after a delay
    const retryDelay = Math.min(2000 * Math.pow(2, retryCount.current - 1), 8000);
    setTimeout(() => {
      if (!imageError) {
        setImageUrl(prev => {
          const url = new URL(prev, window.location.origin);
          url.searchParams.set('retry', nextRetry);
          return url.toString();
        });
      }
    }, retryDelay);
  }, [imageError]);

  const canEditDelete = currentUserIsOwner || (user && (
    user.role === 'admin' || 
    (user.role === 'seller' && product.listedBy === user._id)
  ));

  // Only show edit/delete on listed-cars page
  const showEditDelete = location.pathname === '/listed-cars' && canEditDelete;

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (product.inWishlist !== undefined) {
        setIsInWishlist(product.inWishlist);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/api/wishlist', {
          withCredentials: true
        });
        const isProductInWishlist = response.data.some(item => 
          (item.productId._id === product._id) || (item.productId === product._id)
        );
        setIsInWishlist(isProductInWishlist);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWishlistStatus();
  }, [product._id, user, product.inWishlist]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await axios.delete(`http://localhost:3000/api/wishlist/${product._id}`, {
          withCredentials: true
        });
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
        if (onRemoveFromWishlist) {
          onRemoveFromWishlist();
        }
      } else {
        await axios.post('http://localhost:3000/api/wishlist', {
          productId: product._id
        }, {
          withCredentials: true
        });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        // Optionally redirect to login page or trigger re-authentication
      } else {
        toast.error(error.response?.data?.message || 'Error updating wishlist');
      }
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`, {
        withCredentials: true
      });
      toast.success('Listing deleted successfully');
      if (onDelete) {
        onDelete(productId);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${product.company} ${product.model}`}
          className={`w-full h-full object-cover hover:scale-105 transition-transform duration-500 ${imageError ? 'opacity-50' : ''}`}
          loading="lazy"
          onError={(e) => {
            if (retryCount.current < MAX_RETRIES && !imageError) {
              retryLoadImage();
            } else {
              e.target.src = "https://via.placeholder.com/400x300?text=No+Image+Available";
              setImageError(true);
            }
          }}
        />
        {product.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-orange-600 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
            Featured
          </Badge>
        )}
        <button 
          onClick={toggleWishlist}
          disabled={isLoading}
          className={`absolute top-2 left-2 p-1.5 rounded-full ${
            isInWishlist ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
          } hover:bg-red-500 hover:text-white transition-colors duration-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={isInWishlist ? "Remove from wishlists" : "Add to wishlists"}
        >
          <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
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

        {showEditDelete && (
          <div className="flex gap-2 mt-2 border-t pt-2">
            <Link 
              to={`/edit-car/${product._id}`}
              className="flex-1"
            >
              <Button 
                variant="outline"
                className="w-full text-xs h-7 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="outline"
              className="flex-1 text-xs h-7 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              onClick={() => handleDelete(product._id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
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
        <CarCard key={product._id} product={product} onDelete={(deletedProductId) => {
          setProducts(products.filter(product => product._id !== deletedProductId));
        }} />
      ))}
    </div>
  );
});

CarListingContainer.displayName = 'CarListingContainer';

export { CarCard, CarListingContainer };
export default CarListingContainer;