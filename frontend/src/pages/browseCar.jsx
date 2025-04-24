import React, { useState, useEffect } from 'react';
import { CarListingContainer } from '@/components/productCards';
import FilterSidebar from '@/components/filter';
import axios from 'axios';

const BrowseCarPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000000],
    yearRange: [2000, 2025],
    make: '',
    model: '',
    features: []
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/products', {
          params: {
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1],
            minYear: filters.yearRange[0],
            maxYear: filters.yearRange[1],
            make: filters.make,
            model: filters.model,
            features: filters.features.join(',')
          }
        });
        setProducts(response.data.products);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Filter Sidebar */}
      <div className="w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-white border-r border-gray-200">
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Cars</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <CarListingContainer products={products} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseCarPage;
