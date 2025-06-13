import React, { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const CAR_FEATURES = [
  'Air Conditioning', 'Power Windows', 'Power Steering', 'ABS',
  'Airbags', 'Bluetooth', 'Navigation', 'Sunroof', 'Leather Seats',
  'Backup Camera', 'Cruise Control', 'Keyless Entry'
];

const FilterSidebar = ({ filters, metadata, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handlePriceChange = (value) => {
    if (value[0] >= metadata.priceRange[0] && value[1] <= metadata.priceRange[1]) {
      setLocalFilters(prev => ({ ...prev, priceRange: value }));
      onFilterChange({ priceRange: value });
    }
  };

  const handleYearChange = (value) => {
    if (value[0] >= metadata.yearRange[0] && value[1] <= metadata.yearRange[1]) {
      setLocalFilters(prev => ({ ...prev, yearRange: value }));
      onFilterChange({ yearRange: value });
    }
  };

  const handleMakeChange = (value) => {
    const newFilters = {
      make: value === 'all' ? '' : value,
      model: '' // Reset model when make changes
    };
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
    onFilterChange(newFilters);
  };

  const handleModelChange = (value) => {
    const modelValue = value === 'all' ? '' : value;
    setLocalFilters(prev => ({ ...prev, model: modelValue }));
    onFilterChange({ model: modelValue });
  };

  const handleFeatureToggle = (feature) => {
    const newFeatures = localFilters.features.includes(feature)
      ? localFilters.features.filter(f => f !== feature)
      : [...localFilters.features, feature];
    setLocalFilters(prev => ({ ...prev, features: newFeatures }));
    onFilterChange({ features: newFeatures });
  };

  const resetFilters = () => {
    const defaultFilters = {
      priceRange: metadata.priceRange,
      yearRange: metadata.yearRange,
      make: '',
      model: '',
      features: []
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.priceRange[0] > metadata.priceRange[0] ||
      localFilters.priceRange[1] < metadata.priceRange[1] ||
      localFilters.yearRange[0] > metadata.yearRange[0] ||
      localFilters.yearRange[1] < metadata.yearRange[1] ||
      localFilters.make ||
      localFilters.model ||
      localFilters.features.length > 0
    );
  };

  // Only show make/model selectors if metadata is loaded
  const availableMakes = metadata.makes || [];
  const availableModels = metadata.models[localFilters.make] || [];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 m-4 space-y-6 w-80">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Price Range Filter */}
      {metadata.priceRange[1] > 0 && (
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">Price Range (₹)</Label>
          <Slider
            value={localFilters.priceRange}
            onValueChange={handlePriceChange}
            min={metadata.priceRange[0]}
            max={metadata.priceRange[1]}
            step={100000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>₹{localFilters.priceRange[0].toLocaleString()}</span>
            <span>₹{localFilters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Year Range Filter */}
      {metadata.yearRange[1] > 0 && (
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">Year Range</Label>
          <Slider
            value={localFilters.yearRange}
            onValueChange={handleYearChange}
            min={metadata.yearRange[0]}
            max={metadata.yearRange[1]}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{localFilters.yearRange[0]}</span>
            <span>{localFilters.yearRange[1]}</span>
          </div>
        </div>
      )}

      {/* Make Filter */}
      {availableMakes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">Make</Label>
          <Select value={localFilters.make || 'all'} onValueChange={handleMakeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              {availableMakes.map(make => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Model Filter */}
      {localFilters.make && availableModels.length > 0 && (
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">Model</Label>
          <Select 
            value={localFilters.model || 'all'} 
            onValueChange={handleModelChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {availableModels.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Features Filter */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">Features</Label>
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
          {CAR_FEATURES.map(feature => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={localFilters.features.includes(feature)}
                onCheckedChange={() => handleFeatureToggle(feature)}
              />
              <Label 
                htmlFor={feature} 
                className="text-sm text-gray-600 cursor-pointer"
              >
                {feature}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;