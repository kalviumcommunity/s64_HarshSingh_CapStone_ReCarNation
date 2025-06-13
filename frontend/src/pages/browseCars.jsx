import React, { useState, useEffect } from 'react';
import { CarCard } from '@/components/productCards';
import FilterSidebar from '@/components/filter';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useLocation, useSearchParams } from 'react-router-dom';

const BrowseCarPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({
    makes: [],
    models: {},
    priceRange: [0, 0],
    yearRange: [0, 0]
  });
  
  const [filters, setFilters] = useState({
    priceRange: [0, 10000000],
    yearRange: [2000, 2025],
    make: '',
    model: '',
    features: [],
    search: searchParams.get('search') || ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch metadata (available makes, models, price ranges, year ranges)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/metadata`, {
          withCredentials: true
        });
        setMetadata(response.data);
        
        // Update initial filter ranges based on metadata
        setFilters(prev => ({
          ...prev,
          priceRange: response.data.priceRange,
          yearRange: response.data.yearRange
        }));
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Update filters when search params change
  useEffect(() => {
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          ...(filters.priceRange[0] > metadata.priceRange[0] && { minPrice: filters.priceRange[0] }),
          ...(filters.priceRange[1] < metadata.priceRange[1] && { maxPrice: filters.priceRange[1] }),
          ...(filters.yearRange[0] > metadata.yearRange[0] && { minYear: filters.yearRange[0] }),
          ...(filters.yearRange[1] < metadata.yearRange[1] && { maxYear: filters.yearRange[1] }),
          ...(filters.make && { make: filters.make }),
          ...(filters.model && { model: filters.model }),
          ...(filters.features.length > 0 && { features: filters.features.join(',') }),
          ...(filters.search && { search: filters.search })
        };

        const response = await axios.get(`${API_BASE_URL}/api/products`, {
          params,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        });
        
        const productsData = response.data.products || response.data || [];
        setProducts(productsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to load products. Please try again later.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [filters, metadata]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Cars</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          <FilterSidebar 
            filters={filters} 
            metadata={metadata}
            onFilterChange={handleFilterChange} 
          />
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                >
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No cars found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <CarCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseCarPage;
