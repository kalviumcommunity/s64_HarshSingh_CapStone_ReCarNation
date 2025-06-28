import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Car, ArrowRight, SearchIcon, ThumbsUp, Shield, DollarSign, Award, ChevronRight, Heart, MapPin, Calendar, Fuel, BarChart3 } from "lucide-react";
import axios from "axios";
import { CarCard } from "@/components/productCards";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    make: '',
    model: '',
    maxPrice: ''
  });

  // Car makes and their corresponding models
  const carData = {
    toyota: ['Innova', 'Fortuner', 'Corolla', 'Camry', 'Prius', 'Etios'],
    honda: ['City', 'Civic', 'Accord', 'CR-V', 'Jazz', 'Amaze'],
    ford: ['EcoSport', 'Endeavour', 'Figo', 'Aspire', 'Mustang'],
    maruti: ['Swift', 'Baleno', 'Dzire', 'Alto', 'Vitara Brezza', 'Ertiga', 'Ciaz'],
    hyundai: ['i20', 'Creta', 'Verna', 'Elantra', 'Tucson', 'Santro', 'Grand i10'],
    tata: ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Tigor'],
    mahindra: ['Scorpio', 'XUV500', 'XUV300', 'Bolero', 'Thar', 'KUV100']
  };

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // First try to fetch featured cars
        const featuredResponse = await axios.get(`${API_BASE_URL}/api/products`, {
          params: {
            featured: true,
            limit: 4
          },
          withCredentials: true
        });
        
        // Make sure we have an array of products
        const products = Array.isArray(featuredResponse.data) ? featuredResponse.data : 
                        featuredResponse.data.products || [];
        
        if (products.length > 0) {
          setFeaturedCars(products);
        } else {
          // If no featured cars, fetch random cars
          const randomResponse = await axios.get(`${API_BASE_URL}/api/products`, {
            params: {
              limit: 4,
              sort: 'createdAt',
              order: 'desc'
            },
            withCredentials: true
          });
          
          const randomProducts = Array.isArray(randomResponse.data) ? randomResponse.data :
                                randomResponse.data.products || [];
          
          if (randomProducts.length > 0) {
            setFeaturedCars(randomProducts);
          } else {
            setError('No cars available at the moment');
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cars. Please try again later.');
        setLoading(false);
        console.error('Error fetching cars:', err);
      }
    };

    fetchCars();
  }, []);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setSearchForm(prev => {
      const newForm = { ...prev, [field]: value };
      // Reset model when make changes
      if (field === 'make') {
        newForm.model = '';
      }
      return newForm;
    });
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search parameters
    const searchParams = new URLSearchParams();
    
    if (searchForm.make) {
      searchParams.append('make', searchForm.make);
    }
    if (searchForm.model) {
      searchParams.append('model', searchForm.model);
    }
    if (searchForm.maxPrice) {
      searchParams.append('maxPrice', searchForm.maxPrice);
    }
    
    // Navigate to browse page with search parameters
    navigate(`/browse?${searchParams.toString()}`);
  };

  // Get available models based on selected make
  const getAvailableModels = () => {
    if (!searchForm.make || !carData[searchForm.make]) {
      return [];
    }
    return carData[searchForm.make];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[550px] overflow-hidden">
          {/* Hero Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1583267746897-2cf415887172?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
              alt="Hero background with cars"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/85 to-brand-lightBlue/75"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Find Your Perfect <span className="text-brand-orange">Used Car</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
                Browse thousands of certified pre-owned vehicles from trusted sellers in your area.
              </p>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                  <select 
                    value={searchForm.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className="border border-gray-200 rounded-lg p-2.5 flex-grow focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-200 text-gray-600"
                  >
                    <option value="">All Makes</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="ford">Ford</option>
                    <option value="maruti">Maruti Suzuki</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="tata">Tata</option>
                    <option value="mahindra">Mahindra</option>
                  </select>
                  
                  <select 
                    value={searchForm.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    disabled={!searchForm.make}
                    className="border border-gray-200 rounded-lg p-2.5 flex-grow focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-200 text-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!searchForm.make ? 'Select Make First' : 'All Models'}
                    </option>
                    {getAvailableModels().map((model) => (
                      <option key={model.toLowerCase()} value={model.toLowerCase()}>
                        {model}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    value={searchForm.maxPrice}
                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                    className="border border-gray-200 rounded-lg p-2.5 flex-grow focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-200 text-gray-600"
                  >
                    <option value="">Max Price</option>
                    <option value="500000">₹5 Lakh</option>
                    <option value="1000000">₹10 Lakh</option>
                    <option value="1500000">₹15 Lakh</option>
                    <option value="2000000">₹20 Lakh</option>
                    <option value="3000000">₹30 Lakh</option>
                    <option value="5000000">₹50 Lakh</option>
                  </select>
                  
                  <Button 
                    type="submit" 
                    className="bg-orange-600 hover:bg-orange-500 text-white whitespace-nowrap"
                  >
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </form>
                
                <div className="mt-4 flex justify-between items-center text-sm">
                  <Link to="/browse" className="text-blue-950 hover:text-blue-900 flex items-center transition-colors duration-200">
                    Advanced Search
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                  <span className="text-gray-500 font-medium">{featuredCars.length} vehicles available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Listings Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Cars</h2>
              <Link to="/browse" className="text-orange-600 hover:text-orange-500 flex items-center">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredCars.map((car) => (
                  <CarCard key={car._id} product={car} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Why Choose Us Section */}
        <section className="py-24 bg-[#00254F] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose ReCarNation</h2>
              <div className="w-24 h-1.5 bg-orange-500 mx-auto mb-6 rounded-full"></div>
              <p className="text-lg max-w-3xl mx-auto">
                ReCarNation provides a secure and trustworthy platform for buying and selling used cars,
                with features designed to make your experience smooth and stress-free.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyChooseUsFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 text-center group hover:translate-y-[-5px]"
                >
                  <div className="mb-6 w-24 h-24 flex items-center justify-center rounded-full bg-white/5 mx-auto group-hover:bg-orange-500/10 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-orange-500 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-blue-950 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                ReCarNation makes buying and selling cars simple with our easy-to-follow process.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-600 text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-950 mb-2">
                  Browse Listings
                </h3>
                <p className="text-gray-600">
                  Search through our extensive database of verified used cars using our powerful filters.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-600 text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-950 mb-2">
                  Contact Sellers
                </h3>
                <p className="text-gray-600">
                  Once you find a car you like, connect with the seller directly through our platform.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-600 text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-950 mb-2">
                  Close the Deal
                </h3>
                <p className="text-gray-600">
                  Arrange a test drive, negotiate the price, and complete your purchase with confidence.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-10">
              <Button className= "bg-blue-950 hover:bg-blue-900 text-white">
                <Link to="/browse" className="flex items-center">
                  Find Your Car
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        

        {/* What Our Users Say Section */}
        <section className="py-24 bg-[#00254F] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
              <div className="w-24 h-1.5 bg-orange-500 mx-auto mb-6 rounded-full"></div>
              <p className="text-lg max-w-3xl mx-auto">
                Hear from our satisfied customers about their experience with ReCarNation
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                    name: "Krishi Udayan",
                    role: "Car Buyer",
                    image: "https://randomuser.me/api/portraits/men/32.jpg",
                    quote: "Found my dream car at an amazing price. The verification process gave me confidence in my purchase."
                },
                {
                    name: "Carrol Joe",
                    role: "Car Seller",
                    image: "https://randomuser.me/api/portraits/women/44.jpg",
                    quote: "Sold my car within a week! The platform made the process so smooth and secure."
                },
                {
                    name: "Pankaj Kumar",
                    role: "Car Enthusiast",
                    image: "https://randomuser.me/api/portraits/men/67.jpg",
                    quote: "The best platform for used cars. Great selection and trustworthy sellers."
                }
              ].map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-white/10 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                >
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                    />
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                      <p className="text-orange-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-white/80 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <h2 className="text-3xl font-bold text-blue-950 mb-4">Ready to Buy or Sell a Car?</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Join thousands of satisfied users who have successfully bought or sold vehicles on ReCarNation. 
                    Our platform is designed to make the process simple, secure, and stress-free.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="bg-orange-600 hover:bg-orange-500 text-white">
                      <Link to="/register">Create an Account</Link>
                    </Button>
                    <Button variant="outline" className="border-blue-950 text-blue-950 hover:bg-blue-950 hover:text-white">
                      <Link to="/browse">Browse Listings</Link>
                    </Button>
                  </div>
                </div>
                <div className="relative h-64 md:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=2073&ixlib=rb-4.0.3" 
                    alt="Cars in a dealership lot" 
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Why Choose Us Features
const whyChooseUsFeatures = [
  {
    icon: <Shield className="h-12 w-12 text-orange-600" />,
    title: "Verified Sellers",
    description: "All our sellers go through a rigorous verification process to ensure legitimacy and trustworthiness."
  },
  {
    icon: <ThumbsUp className="h-12 w-12 text-orange-600" />,
    title: "Quality Assurance",
    description: "Each listed vehicle undergoes an inspection process to ensure that you get what you pay for."
  },
  {
    icon: <DollarSign className="h-12 w-12 text-orange-600" />,
    title: "Competitive Pricing",
    description: "Compare prices from multiple sellers to ensure you get the best deal on your next vehicle."
  },
  {
    icon: <Award className="h-12 w-12 text-orange-600" />,
    title: "Dedicated Support",
    description: "Our customer support team is available to assist you through every step of the buying process."
  }
];

export default HomePage;
