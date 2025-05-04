import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const Consent = () => {
  const navigate = useNavigate();
  const { user, updateUserRole } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || 'buyer');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (newRole) => {
    if (currentRole === newRole) return;
    
    setIsLoading(true);
    try {
      await updateUserRole(newRole);
      toast.success(`Role updated to ${newRole} successfully`);
      setCurrentRole(newRole);
      navigate('/profile');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Role</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Current Role: {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}</h2>
          <p className="text-gray-600">Select your role to access different features:</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4 hover:border-orange-500 transition-colors">
            <h3 className="font-semibold mb-2">Buyer</h3>
            <p className="text-sm text-gray-600 mb-4">Browse and purchase vehicles</p>
            <Button 
              variant={currentRole === 'buyer' ? 'default' : 'outline'} 
              className={currentRole === 'buyer' ? 'bg-orange-600' : 'border-orange-600 text-orange-600'} 
              onClick={() => handleRoleChange('buyer')}
              disabled={currentRole === 'buyer' || isLoading}
            >
              {isLoading && currentRole !== 'buyer' ? 'Updating...' : 
                currentRole === 'buyer' ? 'Current Role' : 'Switch to Buyer'}
            </Button>
          </div>

          <div className="border rounded-lg p-4 hover:border-orange-500 transition-colors">
            <h3 className="font-semibold mb-2">Seller</h3>
            <p className="text-sm text-gray-600 mb-4">List and sell your vehicles</p>
            <Button 
              variant={currentRole === 'seller' ? 'default' : 'outline'} 
              className={currentRole === 'seller' ? 'bg-orange-600' : 'border-orange-600 text-orange-600'} 
              onClick={() => handleRoleChange('seller')}
              disabled={currentRole === 'seller' || isLoading}
            >
              {isLoading && currentRole !== 'seller' ? 'Updating...' : 
                currentRole === 'seller' ? 'Current Role' : 'Switch to Seller'}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Important Notice</h3>
          <p className="text-sm text-gray-600">
            Switching to a seller account will allow you to list vehicles for sale. 
            You'll need to provide additional information and agree to our seller terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Consent;