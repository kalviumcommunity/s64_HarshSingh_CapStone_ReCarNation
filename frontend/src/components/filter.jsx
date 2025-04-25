import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const CAR_MAKES = [
  'Audi', 'BMW', 'Ford', 'Jeep', 'Honda', 'Hyundai', 'Kia', 'Mahindra',
  'Skoda', 'Suzuki', 'Tata', 'Toyota', 'Volkswagen'
];

const CAR_FEATURES = [
  'Air Conditioning', 'Power Windows', 'Power Steering', 'ABS',
  'Airbags', 'Bluetooth', 'Navigation', 'Sunroof', 'Leather Seats',
  'Backup Camera', 'Cruise Control', 'Keyless Entry'
];

const FilterSidebar = ({ filters, onFilterChange }) => {
  const handlePriceChange = (value) => {
    onFilterChange({ priceRange: value });
  };

  const handleYearChange = (value) => {
    onFilterChange({ yearRange: value });
  };

  const handleMakeChange = (value) => {
    onFilterChange({ make: value });
  };

  const handleModelChange = (value) => {
    onFilterChange({ model: value });
  };

  const handleFeatureToggle = (feature) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    onFilterChange({ features: newFeatures });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 m-4 space-y-6 w-80">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Filters</h2>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">Price Range (₹)</Label>
        <Slider
          value={filters.priceRange}
          onValueChange={handlePriceChange}
          min={0}
          max={10000000}
          step={100000}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>₹{filters.priceRange[0].toLocaleString()}</span>
          <span>₹{filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Year Range Filter */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">Year Range</Label>
        <Slider
          value={filters.yearRange}
          onValueChange={handleYearChange}
          min={2000}
          max={2025}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{filters.yearRange[0]}</span>
          <span>{filters.yearRange[1]}</span>
        </div>
      </div>

      {/* Make Filter */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">Make</Label>
        <Select value={filters.make} onValueChange={handleMakeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select make" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Makes</SelectItem>
            {CAR_MAKES.map(make => (
              <SelectItem key={make} value={make}>{make}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Filter */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">Model</Label>
        <Select value={filters.model} onValueChange={handleModelChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            {/* Model options would be populated based on selected make */}
          </SelectContent>
        </Select>
      </div>

      {/* Features Filter */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">Features</Label>
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
          {CAR_FEATURES.map(feature => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={filters.features.includes(feature)}
                onCheckedChange={() => handleFeatureToggle(feature)}
              />
              <Label htmlFor={feature} className="text-sm text-gray-600">{feature}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;