import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car, Calendar, Fuel, MapPin, ShoppingCart } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [carDetails, setCarDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch car details
  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) {
        setError("Invalid car ID");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Car not found");
          }
          throw new Error(`Failed to fetch car details: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data) {
          throw new Error("No car data received");
        }
        setCarDetails(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching car details:", err);
        setError(err.message);
        setCarDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  // Handle order confirmation
  const handleOrder = async (payLater = false) => {
    if (!address.trim()) {
      alert('Please enter your delivery address');
      return;
    }
    
    setIsPlacingOrder(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/orders`,
        {
          productId: id,
          address,
          paymentStatus: 'pending',
          paymentMethod: payLater ? 'cash' : 'online',
        },
        { withCredentials: true }
      );
      
      if (res.status === 201) {
        const orderId = res.data._id;
        console.log('Order created successfully:', res.data);
        
        if (payLater) {
          // For pay later, go to orders page
          navigate('/orders');
        } else {
          // For pay now, redirect to payment page
          navigate(`/payment/${orderId}`, { 
            state: { 
              order: res.data,
              returnUrl: '/orders' 
            } 
          });
        }
      }
    } catch (err) {
      console.error('Order creation error:', err);
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Format price with proper null check
  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'Price not available';
    return `₹${price.toLocaleString()}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-brand-blue border-r-brand-blue border-b-gray-200 border-l-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-medium text-gray-700">Loading order details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !carDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-700 mb-6">{error || "Could not load car details"}</p>
            <div className="space-x-4">
              <Button 
                onClick={() => navigate(-1)} 
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Go Back
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mr-4 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-brand-blue">Order Confirmation</h1>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Review Order
            </Badge>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Car Details */}
          <div className="space-y-6">
            {/* Car Overview Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Overview</h2>
                
                {/* Car Image */}
                <div className="mb-6">
                  {carDetails.images && carDetails.images.length > 0 ? (
                    <img 
                      src={carDetails.images[0]?.url || carDetails.images[0]} 
                      alt={carDetails.title} 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                </div>

                {/* Car Details */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-brand-blue">{carDetails.title}</h3>
                  
                  {/* Key Specs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Year</p>
                        <p className="font-medium">{carDetails.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Fuel className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Fuel Type</p>
                        <p className="font-medium">{carDetails.fuelType}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Car className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Transmission</p>
                        <p className="font-medium">{carDetails.transmission}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{carDetails.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {carDetails.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600 text-sm">{carDetails.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features Card */}
            {carDetails.features && carDetails.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {carDetails.features.slice(0, 8).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-2 w-2 bg-orange-600 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary & Address */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vehicle Price</span>
                  <span className="font-medium">{formatPrice(carDetails.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium">₹5,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Documentation</span>
                  <span className="font-medium">₹2,500</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-brand-blue">{formatPrice(carDetails.price + 7500)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                    placeholder="Enter your complete delivery address including street, city, state, and postal code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  {!address.trim() && (
                    <p className="text-red-500 text-sm mt-1">Delivery address is required</p>
                  )}
                </div>

                {/* User Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {user?.name || 'Not provided'}</p>
                    <p><span className="font-medium">Email:</span> {user?.email || 'Not provided'}</p>
                    <p><span className="font-medium">Phone:</span> {user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 text-lg"
                  onClick={() => handleOrder(false)}
                  disabled={!address.trim() || isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Confirm & Pay Now
                    </>
                  )}
                </Button>
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold py-3 text-lg"
                  onClick={() => handleOrder(true)}
                  disabled={!address.trim() || isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Pay Later"
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => navigate(-1)}
                >
                  Back to Car Details
                </Button>
              </div>

              {/* Note */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  🔒 Secure payment powered by Razorpay. You'll be redirected to complete your payment safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;