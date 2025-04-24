import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Heart, 
  Clock, 
  Car, 
  Warehouse, 
  Settings, 
  User,
  ChevronRight,
  Mail,
  Phone,
  LogOut
} from "lucide-react";

function UserProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    profilePicture: null,
    role: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        // Check if there's a token in localStorage as a fallback
        const userToken = localStorage.getItem('user');
        
        if (userToken) {
          try {
            // Try to use cached user data if available
            const userData = JSON.parse(userToken);
            setUserData(userData);
            setIsLoading(false);
            console.log("Using cached user data:", userData);
            return; // Skip API call if we have local data
          } catch (err) {
            console.log("Error parsing cached user data, proceeding with API call");
          }
        }
        
        try {
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'GET',
            credentials: 'include', // Necessary for cookies to be sent
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            if (response.status === 404) {
              console.log("API endpoint not found, redirecting to login");
              navigate('/login');
              return;
            }
            throw new Error('Not authenticated');
          }
          
          const data = await response.json();
          const profileData = data.userProfile || data.user; // Try both formats
          setUserData(profileData);
        } catch (apiErr) {
          console.log("API call failed, falling back to default data");
          // Use default data for testing purposes
          setUserData({
            name: "Test User",
            email: "test@example.com",
            role: "user"
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(err.message);
        setIsLoading(false);
        // Redirect to login if not authenticated
        navigate('/login');
      }
    };
    
    fetchUserProfile();
  }, [navigate]);
  
  // Menu items
  const menuItems = [
    { 
      title: "My Orders", 
      icon: <Package className="h-5 w-5 text-gray-500" />, 
      path: "/orders"
    },
    { 
      title: "Shortlisted Vehicles", 
      icon: <Heart className="h-5 w-5 text-gray-500" />, 
      path: "/shortlisted"
    },
    { 
      title: "My Activity", 
      icon: <Clock className="h-5 w-5 text-gray-500" />, 
      path: "/activity"
    },
    { 
      title: "My Vehicles", 
      icon: <Car className="h-5 w-5 text-gray-500" />, 
      path: "/my-vehicles"
    },
    { 
      title: "My Garage", 
      icon: <Warehouse className="h-5 w-5 text-gray-500" />, 
      path: "/garage"
    },
    { 
      title: "Manage Consents", 
      icon: <Settings className="h-5 w-5 text-gray-500" />, 
      path: "/consents"
    },
    { 
      title: "Profile Settings", 
      icon: <User className="h-5 w-5 text-gray-500" />, 
      path: "/profile/settings"
    }
  ];

  function handleNavigation(path) {
    navigate(path);
  }

  function handleLogout() {
    // Clear localStorage data first to ensure logout works even if backend fails
    localStorage.removeItem('user');
    
    // Try to logout on backend, but don't depend on it succeeding
    fetch('http://localhost:3000/api/auth/logout', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => {
        // Don't require json response, just redirect
        navigate('/login');
      })
      .catch(err => {
        console.error("Backend logout failed:", err);
        // Still redirect to login even if API call fails
        navigate('/login');
      });
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow py-8 flex items-center justify-center">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading profile: {error}</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </div>
        </main>
      </div>
    );
  }

  // Get user initial for avatar
  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow py-8">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              {userData.profilePicture ? (
                <img 
                  src={userData.profilePicture} 
                  alt={userData.name} 
                  className="h-24 w-24 rounded-full object-cover mb-4"
                />
              ) : (
                <Avatar className="h-24 w-24 bg-brand-blue text-white text-2xl font-semibold mb-4">
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              )}
              <h1 className="text-xl font-bold text-gray-800">{userData.name}</h1>
              
              <div className="flex items-center mt-2 text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{userData.email}</span>
              </div>
              
              {userData.role && (
                <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                </div>
              )}
              
              {!userData.googleId && (
                <button className="mt-3 flex items-center text-brand-blue hover:text-brand-lightBlue transition-colors duration-200">
                  <Mail className="h-4 w-4 mr-1" />
                  <span className="text-sm">Connect Email or Social Account</span>
                </button>
              )}
            </div>
          </div>

          {/* Menu Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <ul>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleNavigation(item.path)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3 text-gray-700">{item.title}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                  {index < menuItems.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          </div>

          {/* Logout Button */}
          <div className="text-center">
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300 flex items-center gap-2 mx-auto"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserProfilePage;