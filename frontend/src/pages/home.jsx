import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Car, ArrowRight, SearchIcon, ThumbsUp, Shield, DollarSign, Award, ChevronRight, Heart, MapPin, Calendar, Fuel, BarChart3 } from "lucide-react";
import axios from "axios";

const HomePage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products', {
          params: {
            limit: 4,
            sort: 'createdAt',
            order: 'desc'
          }
        });
        
        if (response.data.products && response.data.products.length > 0) {
          setFeaturedCars(response.data.products);
        } else {
          setError('No featured cars available at the moment');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch featured cars. Please try again later.');
        setLoading(false);
        console.error('Error fetching featured cars:', err);
      }
    };

    fetchFeaturedCars();
  }, []);

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
                <div className="flex flex-col sm:flex-row gap-4">
                  <select className="border border-gray-200 rounded-lg p-2.5 flex-grow focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-200 text-gray-600">
                    <option value="">All Makes</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="ford">Ford</option>
                    <option value="maruti">Maruti Suzuki</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="tata">Tata</option>
                    <option value="mahindra">Mahindra</option>
                  </select>
                  
                  <select className="border border-gray-200 rounded-lg p-2.5 flex-grow focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-200 text-gray-600">
                    <option value="">All Models</option>
                    <option value="swift">Swift</option>
                    <option value="i20">i20</option>
                    <option value="city">City</option>
                    <option value="innova">Innova</option>
                    <option value="nexon">Nexon</option>
                    <option value="scorpio">Scorpio</option>
                  </select>
                  
                  <select className="border border-gray-200 rounded-lg p-2.5 flex-grow focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-200 text-gray-600">
                    <option value="">Max Price</option>
                    <option value="500000">₹5 Lakh</option>
                    <option value="1000000">₹10 Lakh</option>
                    <option value="1500000">₹15 Lakh</option>
                    <option value="2000000">₹20 Lakh</option>
                    <option value="3000000">₹30 Lakh</option>
                  </select>
                  
                  <Button className="bg-orange-600 hover:bg-orange-500 text-white">                   <SearchIcon className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                
                <div className="mt-4 flex justify-between items-center text-sm">
                  <Link to="/listings" className="text-brand-blue hover:text-brand-lightBlue flex items-center transition-colors duration-200">
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
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-brand-blue">Featured Listings</h2>
              <Link to="/listings" className="text-brand-orange hover:text-brand-lightOrange font-medium flex items-center">
                View All Listings
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-brand-orange hover:bg-brand-lightOrange text-white"
                >
                  Try Again
                </Button>
              </div>
            ) : featuredCars.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No featured cars available at the moment.</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-brand-blue hover:bg-brand-lightBlue text-white"
                >
                  Refresh
                </Button>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCars.map((car) => (
                  <CarCard key={car._id} {...car} />
              ))}
            </div>
            )}
            
            <div className="text-center mt-10">
              <Button className="bg-blue-950 hover:bg-blue-900 text-white px-8">
                <Link to="/listings">Browse All Cars</Link>
              </Button>
            </div>
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
              <h2 className="text-3xl font-bold text-brand-blue mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                ReCarNation makes buying and selling cars simple with our easy-to-follow process.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-brand-orange text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-brand-blue mb-2">
                  Browse Listings
                </h3>
                <p className="text-gray-600">
                  Search through our extensive database of verified used cars using our powerful filters.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-brand-orange text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-brand-blue mb-2">
                  Contact Sellers
                </h3>
                <p className="text-gray-600">
                  Once you find a car you like, connect with the seller directly through our platform.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-brand-orange text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-brand-blue mb-2">
                  Close the Deal
                </h3>
                <p className="text-gray-600">
                  Arrange a test drive, negotiate the price, and complete your purchase with confidence.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-10">
              <Button className= "bg-blue-950 hover:bg-blue-900 text-white">
                <Link to="/listings" className="flex items-center">
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
                    name: "Ruchi Tiwari",
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
                  <h2 className="text-3xl font-bold text-brand-blue mb-4">Ready to Buy or Sell a Car?</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Join thousands of satisfied users who have successfully bought or sold vehicles on ReCarNation. 
                    Our platform is designed to make the process simple, secure, and stress-free.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="bg-orange-600 hover:bg-orange-500 text-white">
                      <Link to="/register">Create an Account</Link>
                    </Button>
                    <Button variant="outline" className="border-blue-950 text-blue-950 hover:bg-blue-950 hover:text-white">
                      <Link to="/listings">Browse Listings</Link>
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
    icon: <Shield className="h-12 w-12 text-brand-orange" />,
    title: "Verified Sellers",
    description: "All our sellers go through a rigorous verification process to ensure legitimacy and trustworthiness."
  },
  {
    icon: <ThumbsUp className="h-12 w-12 text-brand-orange" />,
    title: "Quality Assurance",
    description: "Each listed vehicle undergoes an inspection process to ensure that you get what you pay for."
  },
  {
    icon: <DollarSign className="h-12 w-12 text-brand-orange" />,
    title: "Competitive Pricing",
    description: "Compare prices from multiple sellers to ensure you get the best deal on your next vehicle."
  },
  {
    icon: <Award className="h-12 w-12 text-brand-orange" />,
    title: "Dedicated Support",
    description: "Our customer support team is available to assist you through every step of the buying process."
  }
];

// Car Card Component
const CarCard = ({
  _id,
  name,
  company,
  model,
  year,
  KilometersTraveled,
  description,
  image,
  price = null
}) => {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x200";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000/uploads/${imagePath}`;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 font-sans">
      <div className="relative h-40 w-full overflow-hidden">
        <img 
          src={getImageUrl(image)} 
          alt={`${year} ${company} ${model}`} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs font-medium px-2 py-1 rounded">
          Featured
        </div>
        <button 
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-2 left-2 p-1.5 rounded-full ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'} hover:bg-red-500 hover:text-white transition-colors duration-300`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-semibold line-clamp-1 text-gray-800 hover:text-blue-900 transition-colors duration-200">
            {year} {company} {model}
          </h3>
          <span className="text-base font-bold text-orange-600">{formatPrice(price)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-xs">{year}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-xs truncate">Location not specified</span>
          </div>
          <div className="flex items-center text-gray-600">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-xs">{KilometersTraveled?.toLocaleString() || '0'} km</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Fuel className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-xs">Petrol</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white transition-colors duration-300 text-sm py-1.5">
            <Car className="h-3.5 w-3.5 mr-1.5" />
            <Link to={`/car/${_id}`}>Details</Link>
          </Button>
          <Link to={`/messaging/${_id}`} className="flex-1">
            <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white transition-colors duration-300 text-sm py-1.5">
              Contact Seller
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
