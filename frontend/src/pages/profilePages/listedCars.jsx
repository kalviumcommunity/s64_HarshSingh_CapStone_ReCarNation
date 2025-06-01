import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Car, Edit, Trash2, Plus, Image, Save, Loader2 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

// CarFormData interface definition
const emptyCarForm = {
  id: "", // Will be assigned by backend for new cars
  title: "",
  price: 0,
  year: new Date().getFullYear(),
  mileage: 0,
  location: "",
  fuelType: "Gasoline",
  transmission: "Automatic",
  description: "",
  imageUrl: ""
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_URL = `${API_BASE_URL}/api/products`;

const ManageCarsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carListings, setCarListings] = useState([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCar, setCurrentCar] = useState(emptyCarForm);
  const [isNewCar, setIsNewCar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  // Fetch all cars on component mount
  useEffect(() => {
    fetchCars();
  }, []);
  
  const fetchCars = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(API_URL, {
        withCredentials: true,
        params: {
          seller: user._id
        }
      });
      
      setCarListings(response.data);
    } catch (err) {
      console.error("Failed to fetch cars:", err);
      setError("Failed to load car listings. Please try again later.");
      toast.error("Failed to load car listings");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenEditDialog = (car, isNew = false) => {
    setCurrentCar(isNew ? emptyCarForm : { ...car });
    setIsNewCar(isNew);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (car) => {
    setCurrentCar(car);
    setIsDeleteDialogOpen(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCar({
      ...currentCar,
      [name]: name === "price" || name === "year" || name === "mileage" 
        ? parseInt(value) || 0 
        : value
    });
  };
  
  const handleSaveCar = async () => {
    setIsSaving(true);
    
    try {
      const formattedData = {
        ...currentCar,
        year: parseInt(currentCar.year) || new Date().getFullYear(),
        mileage: parseInt(currentCar.mileage) || 0,
        price: parseFloat(currentCar.price) || 0,
        make: currentCar.company || currentCar.make, // Handle either field name
        model: currentCar.model,
        location: currentCar.location || "Not specified",
        transmission: currentCar.transmission?.toLowerCase() || "automatic",
        fuelType: currentCar.fuelType?.toLowerCase() || "petrol",
        description: currentCar.description || "",
        contactNumber: currentCar.contactNumber || user?.phoneNumber || ""
      };

      const method = isNewCar ? "POST" : "PUT";
      const url = isNewCar ? API_URL : `${API_URL}/${currentCar._id}`;
      
      const response = await axios({
        method,
        url,
        data: formattedData,
        withCredentials: true
      });
      
      const savedCar = response.data;
      
      if (isNewCar) {
        setCarListings([...carListings, savedCar]);
        toast.success("New car listing added successfully");
      } else {
        setCarListings(
          carListings.map(car => car._id === savedCar._id ? savedCar : car)
        );
        toast.success("Car listing updated successfully");
      }
      
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Failed to save car:", err);
      const errorMessage = err.response?.data?.message || "Failed to save car listing";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteCar = async () => {
    setIsDeleting(true);
    
    try {
      await axios.delete(`${API_URL}/${currentCar._id}`, {
        withCredentials: true
      });
      
      setCarListings(
        carListings.filter(car => car._id !== currentCar._id)
      );
      toast.success("Car listing deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete car:", err);
      toast.error("Failed to delete car listing");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageUpload = (e) => {
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
      toast.error(validationErrors.images);
      return;
    }
  
    // Create form data with images
    const formData = new FormData();
    validFiles.forEach(file => {
      formData.append('images', file);
    });
  
    handleUploadImages(formData);
  };
  
  const handleUploadImages = async (formData) => {
    setIsUploading(true);
    try {
      const response = await axios.post(`${API_URL}/${currentCar._id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      const updatedCar = response.data;
      setCurrentCar(updatedCar);
      setCarListings(carListings.map(car => 
        car._id === updatedCar._id ? updatedCar : car
      ));
      toast.success('Images uploaded successfully');
    } catch (err) {
      console.error('Failed to upload images:', err);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleRemoveImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to remove this image?')) {
      return;
    }
  
    try {
      const response = await axios.delete(`${API_URL}/${currentCar._id}/images/${imageId}`, {
        withCredentials: true
      });
      
      const updatedCar = response.data;
      setCurrentCar(updatedCar);
      setCarListings(carListings.map(car => 
        car._id === updatedCar._id ? updatedCar : car
      ));
      toast.success('Image removed successfully');
    } catch (err) {
      console.error('Failed to remove image:', err);
      toast.error('Failed to remove image');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold text-brand-blue mb-4 md:mb-0">Manage Your Cars</h1>
            <Button 
              onClick={() => handleOpenEditDialog(emptyCarForm, true)}
              className="bg-blue-950 hover:bg-900 transition-colors duration-300 flex items-center gap-2"
              disabled={isLoading}
            >
              <Plus size={16} />
              Add New Car
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 size={48} className="animate-spin text-brand-blue" />
              <span className="ml-2 text-xl text-gray-600">Loading car listings...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-orange-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Error Loading Cars</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button 
                onClick={fetchCars}
                className="bg-brand-blue hover:bg-brand-lightBlue"
              >
                Try Again
              </Button>
            </div>
          ) : carListings.length === 0 ? (
            <div className="text-center py-16">
              <Car size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No Cars Listed Yet</h3>
              <p className="text-gray-500 mb-6">Add your first car to start selling</p>
              <Button 
                onClick={() => handleOpenEditDialog(emptyCarForm, true)}
                className="bg-brand-blue hover:bg-brand-lightBlue"
              >
                <Plus size={16} className="mr-2" />
                Add New Car
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {carListings.map(car => (
                <Card key={car._id} className="overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/3 h-48 sm:h-auto">
                      <img 
                        src={car.images?.[0]?.url || "https://via.placeholder.com/400x300?text=No+Image+Available"} 
                        alt={`${car.make} ${car.model}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300?text=No+Image+Available";
                        }} 
                      />
                    </div>
                    <CardContent className="flex-1 p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 mb-1">
                            {car.make} {car.model}
                          </h3>
                          <div className="text-lg font-bold text-brand-orange mb-2">
                            ₹{(car.price || 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 mb-4">
                            <span className="inline-block mr-3">{car.year || 'N/A'}</span>
                            <span className="inline-block mr-3">•</span>
                            <span className="inline-block mr-3">{(car.mileage || 0).toLocaleString()} km</span>
                            <span className="inline-block mr-3">•</span>
                            <span>{car.transmission || 'N/A'}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                            {car.description || 'No description available'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          className="border-blue-950 text-blue-950 hover:bg-blue-950 hover:text-white"
                          onClick={() => handleOpenEditDialog(car)}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="border-destructive text-orange-600 hover:bg-orange-600 hover:text-white"
                          onClick={() => handleOpenDeleteDialog(car)}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Edit Car Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !isSaving && setIsEditDialogOpen(open)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isNewCar ? "Add New Car" : "Edit Car Details"}</DialogTitle>
            <DialogDescription>
              {isNewCar 
                ? "Fill in the details to add a new car listing." 
                : "Make changes to update this car's information."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">Car Name</label>
              <Input
                id="title"
                name="title"
                value={currentCar.title}
                onChange={handleInputChange}
                placeholder="e.g. 2020 Honda Accord Sport"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">Price (₹)</label>
              <Input
                id="price"
                name="price"
                type="number"
                value={currentCar.price}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="year">Year</label>
              <Input
                id="year"
                name="year"
                type="number"
                value={currentCar.year}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="mileage">Mileage (km)</label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                value={currentCar.mileage}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">Location</label>
              <Input
                id="location"
                name="location"
                value={currentCar.location}
                onChange={handleInputChange}
                placeholder="e.g. Mumbai, MH"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fuelType">Fuel Type</label>
              <Input
                id="fuelType"
                name="fuelType"
                value={currentCar.fuelType}
                onChange={handleInputChange}
                placeholder="e.g. Gasoline, Electric, Hybrid"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="transmission">Transmission</label>
              <Input
                id="transmission"
                name="transmission"
                value={currentCar.transmission}
                onChange={handleInputChange}
                placeholder="e.g. Automatic, Manual"
                disabled={isSaving}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="imageUrl">Image URL</label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={currentCar.imageUrl}
                onChange={handleInputChange}
                placeholder="Enter image URL"
                disabled={isSaving}
              />
              {currentCar.imageUrl && (
                <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                  <img 
                    src={currentCar.imageUrl} 
                    alt="Car preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "";
                    }} 
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Paste an image URL or upload an image file (upload feature coming soon)</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="images">Upload Images</label>
              <input
                id="images"
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading || isSaving}
              />
              {isUploading && (
                <div className="mt-2 text-sm text-gray-600">
                  Uploading... {uploadProgress}%
                </div>
              )}
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {currentCar.images?.map(image => (
                  <div key={image._id} className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={image.url} 
                      alt="Car image" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "";
                      }} 
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                      onClick={() => handleRemoveImage(image._id)}
                      disabled={isUploading || isSaving}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
              <Textarea
                id="description"
                name="description"
                value={currentCar.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your car - mention condition, features, history, etc."
                disabled={isSaving}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCar} 
              className="bg-blue-950 hover:bg-blue-900"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {isNewCar ? "Adding..." : "Updating..."}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  {isNewCar ? "Add Car" : "Save Changes"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your car listing 
              "{currentCar?.title}" from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCar}
              className="bg-orange text-orange-700 hover:text-orange-500"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageCarsPage;