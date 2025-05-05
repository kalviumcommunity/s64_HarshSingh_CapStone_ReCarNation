import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Package, Heart, Clock, Car, Warehouse, 
  Settings, User, ChevronRight, Mail, 
  Phone, LogOut
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';

function UserProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setUserData(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Menu items - dynamic based on role
  const menuItems = [
    { 
      title: "My Orders", 
      icon: <Package className="h-5 w-5 text-gray-500" />, 
      path: "/orders"
    },
    { 
      title: "Wishlist", 
      icon: <Heart className="h-5 w-5 text-gray-500" />, 
      path: "/wishlist"
    },
    { 
      title: "Recent Activity", 
      icon: <Clock className="h-5 w-5 text-gray-500" />, 
      path: "/activity"
    },
    { 
      title: userData.role === 'seller' ? "Listed Vehicles" : "My Vehicles", 
      icon: <Car className="h-5 w-5 text-gray-500" />, 
      path: "/listed-cars"
    },
    ...(userData.role === 'seller' ? [
      { 
        title: "Sell a Car", 
        icon: <Car className="h-5 w-5 text-gray-500" />, 
        path: "/sellCar"
      }
    ] : []),
    { 
      title: "Manage Role", 
      icon: <Settings className="h-5 w-5 text-gray-500" />, 
      path: "/consent"
    },
    { 
      title: "Profile Settings", 
      icon: <User className="h-5 w-5 text-gray-500" />, 
      path: "/profile-settings"
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </div>
        </main>
      </div>
    );
  }

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow py-8">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              {userData.profilePicture ? (
                <img 
                  src={userData.profilePicture} 
                  alt={userData.name} 
                  className="h-24 w-24 rounded-full object-cover mb-4"
                />
              ) : (
                <Avatar className="h-24 w-24 bg-blue-600 text-white text-2xl font-semibold mb-4">
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              )}
              <h1 className="text-xl font-bold text-gray-800">{userData.name}</h1>
              
              <div className="flex items-center mt-2 text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{userData.email}</span>
              </div>
              
              <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

          <div className="text-center mt-6">
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