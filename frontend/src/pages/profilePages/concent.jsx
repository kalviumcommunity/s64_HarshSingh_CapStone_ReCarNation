import React, { useState, useEffect } from 'react'; // Add useEffect
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ErrorBoundary from '@/components/ErrorBoundary';

const ConsentContent = () => {
  const navigate = useNavigate();
  const { user, updateUserRole } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || 'buyer');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState({ open: false, type: null });
  const [contact, setContact] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStep, setVerificationStep] = useState('input'); // 'input' or 'verify'
  const [verificationId, setVerificationId] = useState(null);

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

  const startVerification = async (type) => {
    setVerificationDialog({ open: true, type });
    setVerificationStep('input');
    setContact('');
    setVerificationCode('');
  };

  const handleSendVerification = async () => {
    try {
      setIsLoading(true);
      const endpoint = verificationDialog.type === 'phone' ? '/verify/phone' : '/verify/email';
      console.log('Sending verification request to:', endpoint);
      
      const response = await axios.post(endpoint, {
        [verificationDialog.type === 'phone' ? 'phone' : 'email']: contact,
      }, {
        withCredentials: true
      });

      console.log('Verification response:', response.data);
      
      if (response.data.success) {
        setVerificationStep('verify');
        if (response.data.verificationId) {
          setVerificationId(response.data.verificationId);
        }
        toast.success('Verification code sent successfully');
      } else {
        console.error('Verification failed:', response.data);
        toast.error(response.data.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Verification error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Error sending verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setIsLoading(true);
      console.log('Verifying code with data:', {
        type: verificationDialog.type,
        contact,
        verificationId,
        code: verificationCode,
      });
  
      const response = await axios.post('/api/verify', {
        type: verificationDialog.type,
        contact,
        verificationId,
        code: verificationCode,
      }, {
        withCredentials: true
      });
  
      console.log('Verification response:', response.data);
  
      if (response.data.success) {
        toast.success('Verification successful');
        setVerificationDialog({ open: false, type: null });
  
        // Refresh the entire user profile to get updated verification status
        const { data: profileData } = await axios.get('/auth/me', {
          withCredentials: true
        });
  
        console.log('Updated profile data:', profileData);
  
        if (profileData.user) {
          // Update the user context with the new profile data
          login(profileData.user);
        }
      } else {
        console.error('Verification failed:', response.data);
        toast.error(response.data.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Error verifying code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      {/* Role Management Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
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

      {/* Verification Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Account Verification</h2>
          <p className="text-gray-600">
            {user?.isVerified === true ? (
              <>
                Verified via {user.verifiedWith || 'unknown method'}
                {user.verifiedContact && ` (${user.verifiedContact})`}
              </>
            ) : (
              'Verify your account to access additional features'
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Button
            variant="outline"
            className="border-orange-600 text-orange-600"
            onClick={() => startVerification('phone')}
            disabled={user?.isVerified || isLoading}
          >
            Verify via Phone
          </Button>
          <Button
            variant="outline"
            className="border-orange-600 text-orange-600"
            onClick={() => startVerification('email')}
            disabled={user?.isVerified || isLoading}
          >
            Verify via Email
          </Button>
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog 
        open={verificationDialog.open}
        onOpenChange={(open) => !open && setVerificationDialog({ open: false, type: null })}
      >
        <DialogContent 
          className="sm:max-w-[425px]"
          aria-describedby="verification-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {verificationStep === 'input' ? 'Enter Contact Information' : 'Enter Verification Code'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {verificationStep === 'input' ? (
              <>
                <Input
                  type={verificationDialog.type === 'phone' ? 'tel' : 'email'}
                  placeholder={verificationDialog.type === 'phone' ? 'Enter phone number' : 'Enter email'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
                <Button
                  onClick={handleSendVerification}
                  disabled={!contact || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={!verificationCode || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main component wrapped with ErrorBoundary
const Consent = () => (
  <ErrorBoundary>
    <ConsentContent />
  </ErrorBoundary>
);

export default Consent;


  // Add this useEffect to check verification status on component mount
  // useEffect(() => {
  //   const checkVerificationStatus = async () => {
  //     try {
  //       const response = await axios.get('/verify/status', {
  //         withCredentials: true
  //       });
        
  //       if (response.data.success && response.data.user) {
  //         // Update the user context with the latest verification status
  //         login(response.data.user);
  //       }
  //     } catch (error) {
  //       console.error('Error checking verification status:', error);
  //     }
  //   };
    
  //   checkVerificationStatus();
  // }, []);

