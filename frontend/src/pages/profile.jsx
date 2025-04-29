import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
import { logout } from "../store/slices/authSlice";

function UserProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        // Use user data from Redux store
        if (user) {
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError("Failed to fetch profile data");
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, user, navigate]);

  function handleNavigation(path) {
    navigate(path);
  }

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-between" onClick={() => handleNavigation('/my-listings')}>
              <div className="flex items-center">
                <Car className="mr-2 h-4 w-4" />
                My Listings
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => handleNavigation('/favorites')}>
              <div className="flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                Favorites
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => handleNavigation('/settings')}>
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;