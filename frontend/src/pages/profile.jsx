import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Package, Heart, Clock, Car, Warehouse, 
  Settings, User, ChevronRight, Mail, 
  Phone, LogOut, Trash2, AlertTriangle
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
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
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Clear any stored user data
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Show success message and redirect
      alert('Account deleted successfully');
      navigate('/register');
    } catch (err) {
      console.error("Delete account failed:", err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
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

          <div className="text-center mt-6 space-y-3">
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300 flex items-center gap-2 mx-auto"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            
            <Button 
              onClick={() => setShowDeleteModal(true)}
              variant="outline" 
              className="px-8 py-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors duration-300 flex items-center gap-2 mx-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete your account? This action cannot be undone and will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Permanently delete all your personal data</li>
                <li>Remove all your car listings</li>
                <li>Cancel any pending orders</li>
                <li>Clear your wishlist and activity history</li>
              </ul>
              <p className="text-red-600 font-medium mt-4">
                This action is irreversible!
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button 
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                disabled={isDeleting}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfilePage;