import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Car, MapPin, Fuel, BarChart3, User, MessageSquare, Heart, Share2, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const CarDetailsPage = () => {
  const { id } = useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [carDetails, setCarDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch car details from backend
  useEffect(() => {
    const fetchCarDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/cars/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch car details: ${response.status}`);
        }
        
        const data = await response.json();
        setCarDetails(data);
      } catch (err) {
        console.error("Error fetching car details:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Header /> */}
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-brand-blue border-r-brand-blue border-b-gray-200 border-l-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-medium text-gray-700">Loading car details...</p>
          </div>
        </main>
        {/* <Footer /> */}
      </div>
    );
  }

  // Error state
  if (error || !carDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Header /> */}
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-700 mb-6">{error || "Could not load car details"}</p>
            <Link to="/cars">
              <Button className="bg-brand-blue hover:bg-brand-lightBlue text-white">
                Back to Search
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Car Images and Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                {/* Main Image */}
                <div className="relative h-[400px]">
                  <img 
                    src={carDetails.images[activeImageIndex]} 
                    alt={carDetails.title} 
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-brand-orange text-white">
                    Featured
                  </Badge>
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="bg-white">
                      <Heart className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                
                {/* Thumbnail Images */}
                <div className="grid grid-cols-4 gap-2 p-2">
                  {carDetails.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`h-20 cursor-pointer border-2 rounded overflow-hidden ${
                        index === activeImageIndex ? 'border-brand-orange' : 'border-transparent'
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${carDetails.title} - Image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Car Details Tabs */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <Tabs defaultValue="overview">
                  <TabsList className="w-full border-b">
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                    <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
                    <TabsTrigger value="seller" className="flex-1">Seller Info</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="p-6">
                    <h2 className="text-2xl font-bold text-brand-blue mb-6">{carDetails.title}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Year</p>
                          <p className="font-medium">{carDetails.year}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Mileage</p>
                          <p className="font-medium">{carDetails.mileage.toLocaleString()} miles</p>
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
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">VIN</p>
                          <p className="font-medium">{carDetails.vin}</p>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-brand-blue mb-2">Description</h3>
                    <p className="text-gray-700 mb-6">{carDetails.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-brand-blue mb-2">Additional Details</h3>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Exterior Color:</span>
                            <span className="font-medium">{carDetails.exteriorColor}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Interior Color:</span>
                            <span className="font-medium">{carDetails.interiorColor}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Engine:</span>
                            <span className="font-medium">{carDetails.engine}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Drive Type:</span>
                            <span className="font-medium">{carDetails.drive}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Fuel Economy:</span>
                            <span className="font-medium">{carDetails.mpg}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="p-6">
                    <h3 className="text-lg font-semibold text-brand-blue mb-4">Features & Options</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {carDetails.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <div className="h-2 w-2 bg-brand-orange rounded-full mr-2"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="seller" className="p-6">
                    <div className="flex items-center mb-6">
                      <img 
                        src={carDetails.seller.avatar}
                        alt={carDetails.seller.name}
                        className="h-16 w-16 rounded-full mr-4"
                      />
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold">{carDetails.seller.name}</h3>
                          {carDetails.seller.verified && (
                            <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center text-yellow-400">
                          {Array(5).fill(0).map((_, i) => (
                            <svg 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(carDetails.seller.rating) ? 'fill-current' : 'text-gray-300'}`} 
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                          <span className="ml-1 text-sm text-gray-600">{carDetails.seller.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Response Rate</p>
                        <p className="font-medium">{carDetails.seller.responseRate}%</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Response Time</p>
                        <p className="font-medium">{carDetails.seller.responseTime}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">{carDetails.seller.memberSince}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Listings</p>
                        <p className="font-medium">{carDetails.seller.listingsCount} cars</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Right Column - Price and Contact */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-brand-blue">₹{carDetails.price.toLocaleString()}</h2>
                </div>
                
                <div className="space-y-4 mb-6">
                  <Link to={`/messaging/${id}`}>
                    <Button className="w-full bg-brand-orange hover:bg-brand-lightOrange text-white">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contact Seller
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
                    <Phone className="h-5 w-5 mr-2" />
                    Show Phone Number
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Send a message</h3>
                  <Textarea 
                    placeholder="Hi, I'm interested in your car. Is it still available?"
                    className="mb-3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Link to={`/messaging/${id}`}>
                    <Button className="w-full bg-brand-blue hover:bg-brand-lightBlue text-white">
                      Send Message
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Safety Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="h-2 w-2 bg-brand-orange rounded-full mt-1.5 mr-2"></div>
                    <span>Meet in a safe, public place</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-2 w-2 bg-brand-orange rounded-full mt-1.5 mr-2"></div>
                    <span>Don't pay or transfer money before seeing the vehicle</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-2 w-2 bg-brand-orange rounded-full mt-1.5 mr-2"></div>
                    <span>Test drive the vehicle before making a decision</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-2 w-2 bg-brand-orange rounded-full mt-1.5 mr-2"></div>
                    <span>Verify vehicle history and title before purchasing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* <Footer /> */}
    </div>
  );
};

// Phone icon component
const Phone = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

export default CarDetailsPage;