import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SearchIcon, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search for cars...", 
  initialValue = "",
  showButton = true,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [error, setError] = useState('');
  
  const debounceTimeout = useRef(null);
  const searchInputRef = useRef(null);

  // Debounced function to fetch AI suggestions
  const fetchSuggestion = async (query) => {
    if (query.trim().length < 2) {
      setSuggestion('');
      setShowSuggestion(false);
      return;
    }

    setIsLoadingSuggestion(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/autocomplete`,
        { prompt: query.trim() },
        {
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data.success && response.data.suggestion) {
        setSuggestion(response.data.suggestion);
        setShowSuggestion(true);
      } else {
        setSuggestion('');
        setShowSuggestion(false);
      }
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      
      // Handle different error types
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment.');
      } else if (error.response?.status >= 500) {
        setError('Service temporarily unavailable.');
      } else {
        setError('Unable to load suggestions.');
      }
      
      setSuggestion('');
      setShowSuggestion(false);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Hide suggestion immediately if input is too short
    if (value.trim().length < 2) {
      setSuggestion('');
      setShowSuggestion(false);
      setError('');
      return;
    }

    // Set new timeout for API call
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestion(value);
    }, 500); // 500ms delay
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query && onSearch) {
      onSearch(query);
      setShowSuggestion(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = () => {
    if (suggestion) {
      setSearchQuery(suggestion);
      setShowSuggestion(false);
      if (onSearch) {
        onSearch(suggestion);
      }
    }
  };

  // Handle click outside to hide suggestion
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestion(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Update search query when initialValue changes
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  return (
    <div className={`relative ${className}`} ref={searchInputRef}>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-200 text-gray-700"
          />
          
          {/* Loading indicator */}
          {isLoadingSuggestion && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            </div>
          )}
          
          {/* Search icon when not loading */}
          {!isLoadingSuggestion && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
        
        {showButton && (
          <Button 
            type="submit" 
            className="bg-orange-600 hover:bg-orange-500 text-white px-6"
            disabled={!searchQuery.trim()}
          >
            <SearchIcon className="h-4 w-4 mr-2" />
            Search
          </Button>
        )}
      </form>

      {/* AI Suggestion */}
      {showSuggestion && suggestion && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div 
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 flex items-center gap-2"
            onClick={handleSuggestionClick}
          >
            <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
            <div className="flex-grow">
              <div className="text-sm text-gray-600 mb-1">AI Suggestion:</div>
              <div className="text-gray-900 font-medium">{suggestion}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;