import { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Check, AlertCircle, Car, Upload, X } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

// Form validation schema
const REQUIRED_FIELDS = {
  1: ['make', 'model', 'year', 'price', 'mileage'],
  2: ['images'],
  3: ['location', 'contactNumber']
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SellCarPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    mileage: '',
    price: '',
    transmission: '',
    fuelType: '',
    description: '',
    location: '',
    contactNumber: '',
    images: []
  });
  const [errors, setErrors] = useState({});

  // Cleanup function for image previews
  const cleanup = useCallback(() => {
    formData.images.forEach(img => {
      URL.revokeObjectURL(img.preview);
    });
  }, [formData.images]);

  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const validationErrors = {};
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        validationErrors.images = 'Only JPG, PNG and WebP images are allowed';
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.images = 'Images must be less than 5MB';
        return false;
      }
      return true;
    });

    if (Object.keys(validationErrors).length) {
      setErrors(prev => ({ ...prev, ...validationErrors }));
      return;
    }

    // Create preview URLs and store file objects
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  }, []);

  // Add drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const validationErrors = {};
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        validationErrors.images = 'Only JPG, PNG and WebP images are allowed';
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.images = 'Images must be less than 5MB';
        return false;
      }
      return true;
    });

    if (Object.keys(validationErrors).length) {
      setErrors(prev => ({ ...prev, ...validationErrors }));
      return;
    }

    // Create preview URLs and store file objects
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  }, []);

  // Remove image
  const handleRemoveImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  // Validate current step
  const validateStep = useCallback((step) => {
    const newErrors = {};
    const requiredFields = REQUIRED_FIELDS[step] || [];

    requiredFields.forEach(field => {
      if (field === 'images' && formData.images.length === 0) {
        newErrors[field] = 'At least one image is required';
      } else if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle next step
  const nextStep = useCallback(() => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep, validateStep]);

  // Handle previous step
  const prevStep = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!user) {
        toast.error('Please log in to create a listing');
        return;
    }

    try {
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.keys(formData).forEach(key => {
            if (key !== 'images') {
                formDataToSend.append(key, formData[key]);
            }
        });

        // Append images
        formData.images.forEach((img, index) => {
            formDataToSend.append('images', img.file);
        });

        // Add user ID
        formDataToSend.append('userId', user._id);

        // Log the FormData contents for debugging
        for (let pair of formDataToSend.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await axios.post(`${API_BASE_URL}/api/products/`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        });

        if (response.data) {
            toast.success('Car listing created successfully!');
            // Reset form
            setFormData({
                make: '',
                model: '',
                year: '',
                trim: '',
                mileage: '',
                price: '',
                transmission: '',
                fuelType: '',
                description: '',
                location: '',
                contactNumber: '',
                images: []
            });
            setActiveStep(1);
            setUploadProgress(0);
            // Redirect to home page
            navigate('/');
        }
    } catch (err) {
        console.error('Error creating listing:', err);
        const errorMessage = err.response?.data?.message || 'Failed to create listing. Please try again.';
        // Log more detailed error information
        if (err.response?.data?.details) {
            console.error('Server error details:', err.response.data.details);
        }
        setError(errorMessage);
        toast.error(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Progress steps data
  const steps = [
    { id: 1, title: 'Car Details' },
    { id: 2, title: 'Photos' },
    { id: 3, title: 'Contact Info' },
    { id: 4, title: 'Review' }
  ];

  // Update the image preview section in the review step
  const renderImagePreview = () => {
    if (formData.images.length === 0) {
      return (
        <div className="col-span-3 h-20 bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-sm text-gray-500">No photos uploaded</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2">
        {formData.images.slice(0, 3).map((image, index) => (
          <div key={index} className="h-20 bg-gray-300 rounded-md overflow-hidden">
            <img 
              src={image.preview}
              alt={`Car photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {formData.images.length > 3 && (
          <div className="h-20 bg-gray-700 rounded-md flex items-center justify-center text-white">
            +{formData.images.length - 3} more
          </div>
        )}
      </div>
    );
  };

  // Update the image upload section
  const renderImageUploadSection = () => (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-semibold text-brand-blue">Upload Photos</h2>
      <p className="text-gray-600">
        High-quality photos increase your chances of selling. Upload at least 5 photos from different angles.
      </p>

      <div 
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors duration-200 hover:border-orange-600 ${
          isUploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
          disabled={isUploading}
        />
        <label 
          htmlFor="image-upload"
          className={`cursor-pointer block ${isUploading ? 'cursor-not-allowed' : ''}`}
        >
          <div className="mx-auto flex flex-col items-center">
            {isUploading ? (
              <>
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-600 mb-2">
                  Uploading... {uploadProgress}%
                </p>
              </>
            ) : (
              <>
                <ImagePlus className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  JPG, PNG or WebP files, max 5MB each
                </p>
                <Button 
                  variant="outline" 
                  className="border-blue-950 text-blue-950 hover:bg-blue-950 hover:text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              </>
            )}
          </div>
        </label>
      </div>

      {errors.images && (
        <div className="flex items-center text-red-500 text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          {errors.images}
        </div>
      )}

      {formData.images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">
            Uploaded Images ({formData.images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group h-32 bg-gray-100 rounded-md overflow-hidden">
                <img 
                  src={image.preview}
                  alt={`Car image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button 
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add navigation buttons */}
      <div className="pt-4 flex justify-between">
        <Button 
          variant="outline" 
          className="border-gray-300 text-gray-700"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button 
          className="bg-orange-600 hover:bg-orange-500 text-white"
          onClick={nextStep}
          disabled={formData.images.length === 0}
        >
          Next: Contact Info
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-950 p-6 text-white">
            <h1 className="text-2xl font-bold">Sell Your Car</h1>
            <p className="text-gray-200">Reach thousands of potential buyers with your listing</p>
          </div>
          
          <div className="p-6">
            {/* Progress Steps */}
            <div className="flex justify-between mb-8 relative">
              <div className="absolute top-1/2 h-0.5 w-full bg-gray-300 -translate-y-1/2 z-0"></div>
              
              {steps.map(step => (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center relative z-10 ${
                    step.id < activeStep 
                      ? 'text-green-600' 
                      : step.id === activeStep 
                        ? 'text-orange-600' 
                        : 'text-gray-400'
                  }`}
                >
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                      step.id < activeStep 
                        ? 'bg-green-100' 
                        : step.id === activeStep 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-gray-200'
                    }`}
                  >
                    {step.id < activeStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
              ))}
            </div>

            {/* Form Steps */}
            <div className="space-y-6">
              {/* Step 1: Car Details */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-brand-blue">Enter Your Car Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <select 
                        id="make"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        className={`w-full border rounded p-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue ${
                          errors.make ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Select Make</option>
                        <option value="Audi">Audi</option>
                        <option value="BMW">BMW</option>
                        <option value="Ford">Ford</option>
                        <option value="Jeep">Jeep</option>
                        <option value="Honda">Honda</option>
                        <option value="Mercedes">Hyundai</option>
                        <option value="Kia">Kia</option>
                        <option value="Toyota">Mahindra</option>
                        <option value="Skoda">Skoda</option>
                        <option value="Suzuko">Suzuki</option>
                        <option value="Tata">Tata</option>
                        <option value="Toyota">Toyota</option>
                        <option value="Ford">Volkswagen</option>
                      </select>
                      {errors.make && (
                        <p className="text-red-500 text-xs mt-1">{errors.make}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className={errors.model ? 'border-red-500' : ''}
                        placeholder="Enter model"
                      />
                      {errors.model && (
                        <p className="text-red-500 text-xs mt-1">{errors.model}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <select 
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className={`w-full border rounded p-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue ${
                          errors.year ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 24 }, (_, i) => 2025 - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {errors.year && (
                        <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mileage">Mileage (km)</Label>
                      <Input
                        id="mileage"
                        name="mileage"
                        type="number"
                        value={formData.mileage}
                        onChange={handleChange}
                        className={errors.mileage ? 'border-red-500' : ''}
                        placeholder="Enter mileage"
                      />
                      {errors.mileage && (
                        <p className="text-red-500 text-xs mt-1">{errors.mileage}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        className={errors.price ? 'border-red-500' : ''}
                        placeholder="Enter price"
                      />
                      {errors.price && (
                        <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transmission">Transmission</Label>
                      <select 
                        id="transmission"
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleChange}
                        className="w-full border rounded p-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      >
                        <option value="">Select Transmission</option>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                        <option value="cvt">CVT</option>
                        <option value="dualClutch">Dual Clutch</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type</Label>
                      <select 
                        id="fuelType"
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleChange}
                        className="w-full border rounded p-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      >
                        <option value="">Select Fuel Type</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                        <option value="cng">CNG</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Describe your car's condition, features, history, etc."
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      className="bg-orange-600 hover:bg-lightorange text-white"
                      onClick={nextStep}
                    >
                      Next: Add Photos
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Photos */}
              {activeStep === 2 && renderImageUploadSection()}

              {/* Step 3: Contact Information */}
              {activeStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-brand-blue">Your Contact Information</h2>
                  <p className="text-gray-600">
                    How would you like potential buyers to contact you?
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className={errors.location ? 'border-red-500' : ''}
                        placeholder="City, State"
                      />
                      {errors.location && (
                        <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className={errors.contactNumber ? 'border-red-500' : ''}
                        placeholder="Enter your phone number"
                      />
                      {errors.contactNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      className="border-gray-300 text-gray-700"
                      onClick={prevStep}
                    >
                      Back
                    </Button>
                    <Button 
                      className="bg-orange-600 hover:bg-lightOrange-500 text-white"
                      onClick={nextStep}
                    >
                      Next: Review Listing
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {activeStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-brand-blue">Review Your Listing</h2>
                  <p className="text-gray-600">
                    Please review your listing details before submitting.
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                      <p className="text-sm text-yellow-700">
                        By submitting this listing, you confirm that all information provided is accurate 
                        and that you are the legal owner of the vehicle or authorized to sell it.
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                      <h3 className="text-lg font-small text-blue-950">
                        {formData.year} {formData.make} {formData.model}
                      </h3>
                      <p className="text-lg font-bold text-orange-600">₹{parseInt(formData.price).toLocaleString()}</p>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Year</p>
                          <p className="font-medium">{formData.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Make/Model</p>
                          <p className="font-medium">{formData.make} {formData.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Mileage</p>
                          <p className="font-medium">{parseInt(formData.mileage).toLocaleString()} km</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Transmission</p>
                          <p className="font-medium">{formData.transmission || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fuel Type</p>
                          <p className="font-medium">{formData.fuelType || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{formData.location}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-sm">{formData.description || 'No description provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Photos</p>
                        {renderImagePreview()}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      className="border-gray-300 text-gray-700"
                      onClick={prevStep}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button 
                      className="bg-blue-950 hover:bg-blue-900 text-white"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Listing'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-brand-blue mb-4">Listing Tips</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-brand-orange text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Be honest and detailed</h3>
                  <p className="text-sm text-gray-600">
                    Mention both the positives and any issues. Honesty builds trust with potential buyers.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-brand-orange text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Take quality photos</h3>
                  <p className="text-sm text-gray-600">
                    Include exterior shots from multiple angles, interior, engine, and any damage or special features.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-brand-orange text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Price competitively</h3>
                  <p className="text-sm text-gray-600">
                    Research similar vehicles to ensure your price is in line with the market value.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-brand-orange text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-sm font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-medium">Respond promptly</h3>
                  <p className="text-sm text-gray-600">
                    Quick responses to inquiries show professionalism and increase your chances of selling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellCarPage;